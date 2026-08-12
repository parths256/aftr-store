import json, os, secrets
from datetime import datetime, timezone
from pathlib import Path
import razorpay
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
load_dotenv()
BASE=Path(__file__).resolve().parent; ORDERS=BASE/'orders.json'
app=Flask(__name__,template_folder='templates',static_folder='static')
PRODUCTS={1:('Basic Cotton Crew-Neck T-Shirt',550),2:('Printed Casual Shirt',899),3:('Slim-Fit Denim Jeans',1499),4:('Cotton Pyjama Set',799),5:('Formal Trousers',1799),6:('Wool-Blend Sweater',2499),7:('Zippered Hoodie',1999),8:('Ethnic Kurta with Embroidery',2999),9:('Leather Jacket',4499),10:('Blazer (Slim Fit)',4999)}
def client():
 k=os.getenv('RAZORPAY_KEY_ID'); s=os.getenv('RAZORPAY_KEY_SECRET')
 if not k or not s: raise RuntimeError('Add Razorpay keys to .env first.')
 return razorpay.Client(auth=(k,s))
def calc(cart):
 if not isinstance(cart,list) or not cart: raise ValueError('Cart is empty.')
 items=[]; total=0
 for r in cart:
  pid=int(r.get('id',0)); qty=int(r.get('qty',0))
  if pid not in PRODUCTS or qty<1 or qty>20: raise ValueError('Invalid cart item.')
  name,price=PRODUCTS[pid]; total+=price*qty; items.append({'id':pid,'name':name,'qty':qty,'price':price})
 return items,total
def number(): return 'AF'+datetime.now().strftime('%y%m%d')+secrets.token_hex(2).upper()
def save(row):
 try: rows=json.loads(ORDERS.read_text()) if ORDERS.exists() else []
 except: rows=[]
 rows.append(row); ORDERS.write_text(json.dumps(rows,indent=2))
@app.get('/')
def home(): return render_template('index.html')
@app.post('/api/create-order')
def create_order():
 try:
  b=request.get_json(force=True); items,total=calc(b.get('cart')); no=number(); amount=total*100
  rp=client().order.create({'amount':amount,'currency':'INR','receipt':no,'notes':{'aftr_order':no}})
  save({'order_number':no,'status':'payment_pending','created_at':datetime.now(timezone.utc).isoformat(),'customer':b.get('customer',{}),'items':items,'total_rupees':total,'razorpay_order_id':rp['id']})
  return jsonify(order_number=no,razorpay_order_id=rp['id'],amount=amount,currency='INR',key_id=os.getenv('RAZORPAY_KEY_ID'))
 except Exception as e: return jsonify(error=str(e)),400
@app.post('/api/verify-payment')
def verify():
 try:
  b=request.get_json(force=True)
  client().utility.verify_payment_signature({'razorpay_order_id':b['razorpay_order_id'],'razorpay_payment_id':b['razorpay_payment_id'],'razorpay_signature':b['razorpay_signature']})
  items,total=calc(b.get('cart'))
  save({'order_number':b.get('order_number'),'status':'paid_verified','verified_at':datetime.now(timezone.utc).isoformat(),'customer':b.get('customer',{}),'items':items,'total_rupees':total,'razorpay_order_id':b['razorpay_order_id'],'razorpay_payment_id':b['razorpay_payment_id']})
  return jsonify(ok=True)
 except razorpay.errors.SignatureVerificationError: return jsonify(error='Payment signature verification failed. Order not marked paid.'),400
 except Exception as e: return jsonify(error=str(e)),400
@app.post('/api/cod-order')
def cod():
 try:
  b=request.get_json(force=True); items,total=calc(b.get('cart')); no=number(); save({'order_number':no,'status':'cod_pending','created_at':datetime.now(timezone.utc).isoformat(),'customer':b.get('customer',{}),'items':items,'total_rupees':total}); return jsonify(order_number=no)
 except Exception as e: return jsonify(error=str(e)),400
if __name__=='__main__': app.run(debug=True,port=5000)
