"""
Aktualisiert garne.json aus dem öffentlichen Hobbii-Katalog (hobbii.de/products.json)
und berechnet die exakte Farbe jeder Garnfarbe aus dem Produktfoto.
Läuft als GitHub Action (monatlich oder per Hand), lokal: python tools/garne_aktualisieren.py
"""
import json,re,sys,html,io,time,urllib.request,concurrent.futures as cf
from PIL import Image
UA={"User-Agent":"Maschenbuch-Garnliste/1.0 (privates Hobbyprojekt)"}
def get(url,tries=3):
    for t in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=30) as r: return r.read()
        except Exception as e:
            if t==tries-1: raise
            time.sleep(3*(t+1))
def txt(h): return html.unescape(re.sub(r'<[^>]+>',' ',h or '')).replace('\xa0',' ')
def num(s): return float(s.replace(',','.'))
C={ # Farbwörter -> Hex (Näherung aus dem Namen)
'black':'#1c1c1c','schwarz':'#1c1c1c','white':'#f5f5f2','weiß':'#f5f5f2','weiss':'#f5f5f2','off white':'#efe9dc','cream':'#f1e8d2','creme':'#f1e8d2','ivory':'#f3ecd9','natural':'#e9dfc8','natur':'#e9dfc8','beige':'#d8c6a6','sand':'#d6c29b','oatmeal':'#d9cbb0','camel':'#b98a56','caramel':'#b4783f','brown':'#6b4a32','braun':'#6b4a32','chocolate':'#4a2f22','coffee':'#5b3d2b','mocha':'#7a5a45','taupe':'#8f8173','grey':'#8c8c8c','gray':'#8c8c8c','grau':'#8c8c8c','silver':'#bdbdbd','charcoal':'#3e3e42','anthracite':'#3a3b3e','red':'#c0272d','rot':'#c0272d','bordeaux':'#6e1f2b','burgundy':'#6a1e2a','wine':'#6b2134','cherry':'#9e1b32','raspberry':'#b3245a','rasberry':'#b3245a','coral':'#ef7f6a','salmon':'#f0937d','peach':'#f6b994','apricot':'#f2a96b','orange':'#e8742a','rust':'#a9472a','terracotta':'#c1653f','brick':'#9c4430','pink':'#ef8fb3','rose':'#e3a1ad','rosa':'#e3a1ad','blush':'#efc1bf','dusty rose':'#c99197','fuchsia':'#c2287a','magenta':'#b5267b','lilac':'#c3a7d3','lavender':'#b9a7d6','purple':'#6d3b8c','violet':'#6f4ba0','plum':'#6a2d55','aubergine':'#4b2340','yellow':'#f2cd35','gelb':'#f2cd35','mustard':'#c99a2a','ochre':'#c08a2a','lemon':'#f4e36b','gold':'#c9a03a','green':'#3f8a4a','grün':'#3f8a4a','sage':'#9fae8e','mint':'#a8dcc0','olive':'#6f6e34','khaki':'#8f8656','forest':'#2f4f36','bottle':'#1f4d3a','moss':'#6a7a3d','pistachio':'#b6cc8a','lime':'#a6c94a','emerald':'#1f7a55','petrol':'#1f5560','teal':'#2a7f7f','turquoise':'#3cb8b6','aqua':'#7fd0d0','blue':'#2f5fa8','blau':'#2f5fa8','navy':'#1f2b4a','denim':'#4a6c92','sky':'#8cc2e6','baby blue':'#aed3ee','royal':'#2848a0','cobalt':'#2a4fb0','ice':'#d5e8ee','light':None,'dark':None}
LT=lambda h,f: '#'+''.join('%02x'%min(255,int(int(h[i:i+2],16)+(255-int(h[i:i+2],16))*f)) for i in (1,3,5))
DK=lambda h,f: '#'+''.join('%02x'%int(int(h[i:i+2],16)*(1-f)) for i in (1,3,5))
def hexof(name):
    n=re.sub(r'\(.*?\)','',name).lower().strip()
    for k in sorted([k for k in C if C[k]],key=len,reverse=True):
        if re.search(r'\b'+re.escape(k),n):
            h=C[k]
            if re.search(r'\b(light|pale|hell|soft|pastel)',n): h=LT(h,.4)
            if re.search(r'\b(dark|deep|dunkel)',n): h=DK(h,.35)
            return h
    return None
def textur(t,title):
    s=(t+' '+title).lower()
    if 'tweed' in s: return 'tweed'
    if re.search(r'plüsch|chenille|velvet|samt|mohair|flausch|fluffy|bouclé|boucle|teddy|fur',s): return 'flauschig'
    if re.search(r'meliert|melange|mouliné|tonal|marmoriert',s): return 'meliert'
    if re.search(r'farbverlauf|bobbel|cake|verlauf|gradient|self-striping|selbstmusternd|multicolor|mehrfarbig',s): return 'verlauf'
    return 'glatt'

def foto_hex(url):
    """Mittlere Farbe der Bildmitte, ohne die 15 % hellsten und dunkelsten Pixel (Glanz/Schatten)."""
    try:
        im=Image.open(io.BytesIO(get(url+("&" if "?" in url else "?")+"width=64"))).convert("RGB").resize((40,40))
        px=[im.getpixel((x,y)) for x in range(10,30) for y in range(10,30)]
        px.sort(key=lambda p:p[0]*.3+p[1]*.59+p[2]*.11);k=len(px);m=px[int(k*.15):int(k*.85)]
        return "#%02x%02x%02x"%tuple(round(sum(p[i] for p in m)/len(m)) for i in range(3))
    except Exception:
        return None

def main(dst):
    alle=[];page=1
    while True:
        d=json.loads(get(f"https://hobbii.de/products.json?limit=250&page={page}"))["products"]
        if not d: break
        alle+= [p for p in d if p.get("product_type")=="yarn"];page+=1;time.sleep(.5)
    print(len(alle),"Garne geladen")
    try: alt={f["sku"]:f.get("hex") for g in json.load(open(dst,encoding="utf-8"))["garne"] for f in g["farben"]}
    except Exception: alt={}
    out=[]
    for p in alle:
        t=txt(p["body_html"])
        m=re.search(r'Lauflänge[^0-9]{0,40}(\d[\d.,]*)\s*m(?:eter)?',t,re.I)
        if not m:
            m=next((x for x in re.finditer(r'(\d[\d.]*)\s*(?:m|Meter)\b(?!\s*(?:auf|pro)\s*10\s*cm)',t) if int(x.group(1).replace('.',''))>=20),None)
        lauf=int(num(m.group(1).replace('.',''))) if m else None
        g=re.search(r'(\d+)\s*g\b',t); gramm=int(g.group(1)) if g else None
        n=re.search(r'(?:Nadel(?:stärke|größe)?|Häkelnadel)[^0-9]{0,30}(\d+(?:[,.]\d+)?(?:\s*[-–]\s*\d+(?:[,.]\d+)?)?)\s*mm',t,re.I)
        mat=re.search(r'(\d{1,3}\s*%\s*[A-Za-zÄÖÜäöüß-]+(?:[ ,/]+\d{1,3}\s*%\s*[A-Za-zÄÖÜäöüß-]+)*)',t)
        farben=[{"name":v["title"],"sku":v["sku"],"preis":float(v["price"]),"gewicht_g":v["grams"],"verfuegbar":v["available"],
                 "hex":None,"name_hex":hexof(v["title"]),"bild":(v.get("featured_image") or {}).get("src")} for v in p["variants"]]
        out.append({"id":p["id"],"name":p["title"],"marke":p["vendor"],"url":"https://hobbii.de/products/"+p["handle"],"lauflaenge_m":lauf,"knaeuel_g":gramm,
                    "nadel_mm":n.group(1).replace(" ","") if n else None,"material":mat.group(1) if mat else None,"textur":textur(t,p["title"]),"farben":farben})
    alle_f=[f for g in out for f in g["farben"]]
    neu=[f for f in alle_f if f["bild"] and not alt.get(f["sku"])]
    for f in alle_f:
        if alt.get(f["sku"]): f["hex"]=alt[f["sku"]]
    print(len(neu),"Farben werden aus Fotos berechnet")
    with cf.ThreadPoolExecutor(8) as ex:
        for f,h in zip(neu,ex.map(lambda f:foto_hex(f["bild"]),neu)): f["hex"]=h
    for f in alle_f:
        if not f["hex"]: f["hex"]=f["name_hex"]
        f["exakt"]=bool(f["hex"] and f["hex"]!=f["name_hex"]) or bool(alt.get(f["sku"]))
        del f["name_hex"]
    ok=sum(1 for f in alle_f if f["exakt"])
    print(f"{ok} von {len(alle_f)} Farben exakt aus dem Foto")
    json.dump({"quelle":"hobbii.de","stand":time.strftime("%Y-%m-%d"),"garne":out},open(dst,"w",encoding="utf-8"),ensure_ascii=False,separators=(",",":"))

if __name__=="__main__":
    main(sys.argv[1] if len(sys.argv)>1 else "garne.json")
