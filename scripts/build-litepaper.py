"""Build the eight-page project litepaper from the shared editorial source."""
import json, math, random, re, base64, io
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'content/litepaper.json').read_text())
OUT=ROOT/'public/docs/trash-panda-united-litepaper-v0.1.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
for name,file in [('Body','DejaVuSans.ttf'),('Bold','DejaVuSans-Bold.ttf'),('Mono','DejaVuSansMono.ttf')]:
 pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
W,H=595.28,841.89
BG='#091218';PANEL='#10232b';LINE='#2c4951';WHITE='#eef2df';MUTED='#a5b9bd';LIME='#c8f76b';PINK='#ed368e';CYAN='#54d9df'
C=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
C.setTitle('Trash Panda United | Litepaper v0.1 | Testnet Field Guide')
C.setAuthor('Trash Panda United');C.setSubject('Game, economy, ownership and testnet roadmap')

def rect(x,y,w,h,fill,stroke=None):
 C.setFillColor(HexColor(fill));C.setStrokeColor(HexColor(stroke or fill));C.rect(x,H-y-h,w,h,fill=1,stroke=bool(stroke))
def line(x,y,x2,y2,color=LINE,width=1):
 C.setStrokeColor(HexColor(color));C.setLineWidth(width);C.line(x,H-y,x2,H-y2)
def txt(s,x,y,size=10,font='Body',color=WHITE):
 C.setFont(font,size);C.setFillColor(HexColor(color));C.drawString(x,H-y-size,s)
def para(s,x,y,w,size=10.2,color=MUTED,leading=None,font='Body'):
 style=ParagraphStyle('p',fontName=font,fontSize=size,leading=leading or size*1.43,textColor=HexColor(color),spaceAfter=0)
 p=Paragraph(escape(s),style);_,h=p.wrap(w,1000);p.drawOn(C,x,H-y-h);return h
def pill(s,x,y,color=LIME):
 width=pdfmetrics.stringWidth(s,'Mono',8)+18;rect(x,y,width,21,PANEL,color);txt(s,x+9,y+5,8,'Mono',color)
def base(n,label):
 rect(0,0,W,H,BG)
 for x in range(20,600,24):
  for y in range(20,840,24):rect(x,y,.7,.7,'#1d3037')
 rect(0,0,8,108,LIME);txt('TPU / FIELD NOTES',44,27,9,'Mono',LIME);txt('LITEPAPER 0.1',427,27,9,'Mono',MUTED)
 line(44,52,551,52)
 line(44,803,551,803);txt('TRASH PANDA UNITED',44,814,8,'Mono',MUTED);txt(label.upper(),235,814,7.5,'Mono',MUTED);txt(f'{n:02d} / 08',499,814,8,'Mono',LIME)
 C.bookmarkPage('page'+str(n));C.addOutlineEntry(label,'page'+str(n),0)
def chapter(ch,n):
 base(n,ch['id']);txt(ch['eyebrow'],44,72,8.5,'Mono',CYAN)
 title=ch['title'];size=34
 while pdfmetrics.stringWidth(title,'Bold',size)>507:size-=1
 txt(title,44,105,size,'Bold');para(ch['lead'],44,166,490,13,WHITE,19)
def callout(s,y=754):
 rect(44,y,507,38,PANEL);rect(44,y,3,38,LIME);para(s,57,y+7,479,8.3,WHITE,11.2)
def block(b,x,y,w=244,size=10):
 titleh=para(b['title'],x,y,w,11,WHITE,14,'Bold')
 return titleh+10+para(b['text'],x,y+titleh+10,w,size,MUTED)
def arrow(x,y,x2,y2):
 line(x,y,x2,y2,LIME,1.2)
 a=math.atan2(y2-y,x2-x)
 for da in [-.55,.55]:line(x2,y2,x2-7*math.cos(a+da),y2-7*math.sin(a+da),LIME,1.2)

def skyline(y=440,h=260):
 rng=random.Random(17)
 rect(0,y,W,h,'#0c1d28')
 for layer in range(3):
  x=-10
  while x<W:
   bw=rng.randrange(30,65);bh=rng.randrange(45,160)+layer*10;by=y+h-bh
   color=['#17333e','#10252f','#07141c'][layer]
   rect(x,by,bw,bh,color)
   rect(x+8,by-8,bw-17,8,color)
   if rng.random()<.5:line(x+bw/2,by,x+bw/2,by-25,LINE)
   for wx in range(int(x+8),int(x+bw-6),10):
    for wy in range(int(by+15),int(y+h-6),15):
     if rng.random()<.35:rect(wx,wy,3,6,rng.choice(['#285d64','#3b5760','#548269',CYAN]))
   if layer==2 and x>0 and rng.random()<.4:
    rect(x+2,by+22,bw-4,18,PINK);txt('OPEN',x+7,by+26,7,'Mono',BG)
   x+=bw+5
 for i in range(8):line(0,y+h-i*3,W,y+h-i*3,'#122b35')
 line(0,y+h,W,y+h,CYAN,2)

# Cover.
base(1,'Welcome to the wasteland')
pill('TESTNET FIELD GUIDE',44,83)
txt('TRASH',40,129,66,'Bold');txt('PANDA',40,197,66,'Bold');txt('UNITED',40,265,66,'Bold',PINK)
rect(449,137,101,101,PANEL,LINE);txt('T',470,141,75,'Bold',LIME);rect(460,224,79,4,PINK)
txt('A BROKEN WORLD.',44,357,16,'Mono',WHITE);txt('A FRESH START.',44,380,16,'Mono',LIME)
skyline(430,217)
rect(44,609,229,29,LIME);txt('SCAVENGE / BUILD / BELONG',54,618,9,'Mono',BG)
para(D['intro'],44,670,487,13,WHITE,19)
txt('V0.1 / 12 SEP 2026 / BASE SEPOLIA',44,749,9,'Mono',CYAN)
C.linkURL('https://tpunited.xyz',(44,H-789,200,H-770),relative=0);txt('tpunited.xyz',44,776,9,'Mono',LIME)
txt('ALPHA + DEVELOPMENT ROADMAP',297,776,8,'Mono',MUTED)
C.showPage()

for n,ch in enumerate(D['chapters'],2):
 chapter(ch,n);kind=ch['visual']
 if kind=='world':
  para(D['statusNote'],44,218,507,7.3,MUTED,10)
  rect(44,258,507,143,PANEL,LINE)
  # Abstract route map: game locations, not a claim of geographic scale.
  nodes=[(84,299,'TOWN',LIME),(268,299,'OUTSKIRTS',CYAN),(448,299,'SEWERS',PINK)]
  for a,b in zip(nodes,nodes[1:]):arrow(a[0]+28,a[1],b[0]-28,b[1])
  for x,y,label,col in nodes:
   rect(x-12,y-12,24,24,BG,col);rect(x-4,y-4,8,8,col);txt(label,x-28,y+23,8,'Mono',col)
  txt('NPC SERVICES',62,373,7.5,'Mono',MUTED);txt('SALVAGE + ENEMIES',218,373,7.5,'Mono',MUTED);txt('SOLO BOSS RUN',409,373,7.5,'Mono',MUTED)
  block(ch['blocks'][0],44,426);block(ch['blocks'][1],307,426)
  block(ch['blocks'][2],44,603,507,10.2);callout(ch['callout'])
 elif kind=='loop':
  labels=['EXPLORE','FIGHT','SALVAGE','UPGRADE','RETURN']
  for i,label in enumerate(labels):
   x=44+i*104;rect(x,270,91,79,PANEL,LINE);txt('0'+str(i+1),x+10,280,20,'Mono',LIME);txt(label,x+9,319,8,'Mono',WHITE)
   if i<4:arrow(x+93,309,x+101,309)
  txt('REINVEST IN YOUR NEXT RUN',44,371,8.5,'Mono',CYAN)
  block(ch['blocks'][0],44,420,507,10.5)
  block(ch['blocks'][1],44,545);block(ch['blocks'][2],307,545)
  callout(ch['callout'])
 elif kind=='economy':
  xs=[44,167,332]; widths=[123,165,219]
  rect(44,258,507,30,LIME)
  for x,t in zip(xs,ch['table']['headers']):txt(t.upper(),x+10,267,8,'Mono',BG)
  for i,row in enumerate(ch['table']['rows']):
   y=288+i*52;rect(44,y,507,52,PANEL if i%2==0 else '#0d1c24');line(44,y+52,551,y+52)
   for j,t in enumerate(row):para(t,xs[j]+10,y+9,widths[j]-20,8.6,WHITE if j==0 else MUTED,12)
  block(ch['blocks'][0],44,532);block(ch['blocks'][1],307,532);callout(ch['callout'])
 elif kind=='gear':
  rect(44,252,507,137,PANEL,LINE)
  for name,x,label in [('blaster',67,'NEON BLASTER'),('hood',256,'SCAVENGER HOOD')]:
   asset='neon-blaster' if name=='blaster' else 'scavenger-hood'
   svg=(ROOT/'public/assets/equipment'/f'{asset}.svg').read_text()
   image=ImageReader(io.BytesIO(base64.b64decode(re.search(r'data:image/png;base64,([^\"]+)',svg).group(1))))
   iw,ih=image.getSize();scale=min(136/iw,104/ih)
   C.drawImage(image,x,H-264-ih*scale,width=iw*scale,height=ih*scale,mask='auto')
   txt(label,x,374,7,'Mono',CYAN)
  txt('ARMORY',426,275,10,'Mono',LIME);txt('ARTWORK',426,293,10,'Mono',LIME)
  para('From the current equipment collection.',426,320,104,8.3,MUTED,12)
  for i,b in enumerate(ch['blocks']):block(b,44+(i%2)*263,415+(i//2)*166,244,9.5)
  callout(ch['callout'])
 elif kind=='season':
  rect(44,258,507,125,PANEL,LINE)
  for i,(label,sub) in enumerate([('PLAY','Approved events'),('QUALIFY','Published rules'),('REVIEW','Final results')]):
   x=62+i*168;txt('0'+str(i+1),x,274,25,'Mono',LIME);txt(label,x,312,11,'Bold',WHITE);txt(sub,x,345,8,'Mono',MUTED)
  block(ch['blocks'][0],44,413);block(ch['blocks'][1],307,413)
  block(ch['blocks'][2],44,603,507,10.3);callout(ch['callout'])
 elif kind=='trust':
  for i,(name,sub,col) in enumerate([('BROWSER','Inputs + presentation',CYAN),('SERVER','Progress + rewards',LIME),('CHAIN','Supported ownership',PINK)]):
   x=44+i*174;rect(x,260,159,112,PANEL,LINE);txt(name,x+13,278,14,'Bold',col);para(sub,x+13,312,133,10,WHITE)
  for i,b in enumerate(ch['blocks']):block(b,44+(i%2)*263,413+(i//2)*166,244,9.5)
  callout(ch['callout'])
 elif kind=='roadmap':
  line(58,264,58,643,LINE,2)
  for i,b in enumerate(ch['blocks']):
   y=252+i*94;rect(48,y+9,20,20,LIME if i==0 else PANEL,LIME if i==0 else CYAN)
   txt(str(i+1),54,y+12,10,'Mono',BG if i==0 else CYAN);block(b,84,y,463,9.4)
  para(ch['callout'],44,642,507,11,WHITE,15.5)
  txt('ENTER THE WASTELAND',44,695,9,'Mono',LIME)
  for x,label,url in [(44,'PLAY','https://game.tpunited.xyz'),(178,'SEASON RULES','https://tpunited.xyz/program'),(365,'SUPPORT','https://tpunited.xyz/support')]:
   txt(label,x,717,9,'Mono',CYAN);C.linkURL(url,(x,H-735,x+120,H-712),relative=0)
  para('Edition 0.1 / '+D['date']+'. '+D['sourceNote'],44,756,507,6.6,MUTED,8.8)
 C.showPage()
C.save();print(OUT)
