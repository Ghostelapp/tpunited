"""Build the eight-page project litepaper from the shared editorial source."""
import json, math, re, base64, io
from functools import lru_cache
from PIL import Image
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
TEMP=OUT.with_suffix('.pdf.tmp')
C=canvas.Canvas(str(TEMP),pagesize=(W,H),pageCompression=1)
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

@lru_cache
def atlas_asset(sheet,box):
 # Extract the same atlas rectangles used by the game; retain original colors and alpha.
 image=Image.open(ROOT/'public/assets'/f'sheet-{sheet}.webp')
 x,y,w,h=box
 return ImageReader(image.crop((x,y,x+w,y+h)))
def sprite(sheet,box,x,y,w,h):
 image=atlas_asset(sheet,box);iw,ih=image.getSize();scale=min(w/iw,h/ih)
 C.drawImage(image,x+(w-iw*scale)/2,H-y-ih*scale,width=iw*scale,height=ih*scale,mask='auto')
def equipment(asset,x,y,w,h):
 svg=(ROOT/'public/assets/equipment'/f'{asset}.svg').read_text()
 # Equipment SVGs embed the full current atlas and retain their original viewport.
 match=re.search(r'data:image/(?:png|webp);base64,([^\"]+)',svg)
 source=Image.open(io.BytesIO(base64.b64decode(match.group(1))))
 x0,y0,sw,sh=map(int,re.findall(r'viewBox="([^\"]+)"',svg)[1].split())
 image=ImageReader(source if source.size==(sw,sh) else source.crop((x0,y0,x0+sw,y0+sh)))
 iw,ih=image.getSize();scale=min(w/iw,h/ih)
 C.drawImage(image,x+(w-iw*scale)/2,H-y-ih*scale,width=iw*scale,height=ih*scale,mask='auto')
def city_banner(y,h):
 image=Image.open(ROOT/'public/assets/city.png').convert('RGB')
 image.thumbnail((1200,800))
 encoded=io.BytesIO();image.save(encoded,format='JPEG',quality=88)
 iw,ih=image.size;scale=W/iw
 C.saveState();path=C.beginPath();path.rect(0,H-y-h,W,h);C.clipPath(path,stroke=0)
 C.drawImage(ImageReader(encoded),0,H-y-h-(ih*scale-h)/2,width=W,height=ih*scale)
 C.restoreState();line(0,y+h,W,y+h,CYAN)

# Cover.
base(1,'Welcome to the wasteland')
pill('TESTNET FIELD GUIDE',44,83)
txt('TRASH',40,129,66,'Bold');txt('PANDA',40,197,66,'Bold');txt('UNITED',40,265,66,'Bold',PINK)
sprite(1,(356,202,125,158),421,151,133,184)
txt('RACCOON SCAVENGER',422,344,7,'Mono',CYAN)
txt('A BROKEN WORLD.',44,357,16,'Mono',WHITE);txt('A FRESH START.',44,380,16,'Mono',LIME)
city_banner(426,224)
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
  sprite(1,(356,202,125,158),73,267,108,100)
  sprite(4,(302,102,309,340),241,266,112,101)
  sprite(2,(14,987,278,211),403,273,127,94)
  txt('THE SCAVENGER',80,380,8,'Mono',LIME);txt('SCRAP HOUSE',264,380,8,'Mono',CYAN);txt('GARBAGE KING',415,380,8,'Mono',PINK)
  block(ch['blocks'][0],44,426);block(ch['blocks'][1],307,426)
  block(ch['blocks'][2],44,603,507,10.2);callout(ch['callout'])
 elif kind=='loop':
  labels=['EXPLORE','FIGHT','SALVAGE','UPGRADE','RETURN']
  for i,label in enumerate(labels):
   x=44+i*104;rect(x,262,91,118,PANEL,LINE);txt('0'+str(i+1),x+8,270,9,'Mono',LIME);txt(label,x+9,360,8,'Mono',WHITE)
   if i==0:sprite(1,(356,202,125,158),x+15,286,61,66)
   elif i==1:sprite(2,(282,47,146,94),x+9,293,73,54)
   elif i==2:equipment('neon-blaster',x+10,287,71,62)
   elif i==3:equipment('scavenger-hood',x+12,287,68,62)
   else:sprite(4,(302,102,309,340),x+12,286,68,66)
   if i<4:arrow(x+93,320,x+101,320)
  txt('REINVEST IN YOUR NEXT RUN',44,395,8.5,'Mono',CYAN)
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
  sprite(4,(302,102,309,340),63,259,134,105)
  equipment('neon-blaster',228,266,134,98)
  equipment('scavenger-hood',400,259,125,105)
  txt('SCRAP HOUSE',92,374,7,'Mono',LIME);txt('NEON BLASTER',251,374,7,'Mono',CYAN);txt('SCAVENGER HOOD',421,374,7,'Mono',CYAN)
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
C.save();TEMP.replace(OUT);print(OUT)
