import json
import os
import secrets

from datetime import datetime, timezone
from pathlib import Path

import razorpay

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request


load_dotenv()

BASE = Path(__file__).resolve().parent
ORDERS = BASE / "orders.json"

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)


# ---------------------------------
# PRODUCTS
# ---------------------------------

PRODUCTS = {
    1: ("Black Essential T-Shirt", 550),
    2: ("Embroidered Overshirt", 899),
    3: ("Straight-Fit Denim Jeans", 1499),
    4: ("Blue Co-ord Set", 799),
    5: ("Charcoal Tailored Trousers", 1799),
    6: ("Brown Knit Sweater", 2499),
    7: ("Beige Zip Hoodie", 1999),
    8: ("Embroidered Kurta", 2999),
    9: ("Brown Leather Jacket", 4499),
    10: ("Beige Slim-Fit Blazer", 4999)
}

ALLOWED_SIZES = {"S", "M", "L", "XL"}


# ---------------------------------
# RAZORPAY
# ---------------------------------

def client():

    key = os.getenv("RAZORPAY_KEY_ID")
    secret = os.getenv("RAZORPAY_KEY_SECRET")

    if not key or not secret:
        raise RuntimeError(
            "Razorpay keys are missing."
        )

    return razorpay.Client(
        auth=(key, secret)
    )


# ---------------------------------
# CART CALCULATION
# ---------------------------------

def calc(cart):

    if not isinstance(cart, list) or not cart:
        raise ValueError("Cart is empty.")

    items = []
    total = 0

    for row in cart:

        pid = int(row.get("id", 0))
        qty = int(row.get("qty", 0))

        size = str(
            row.get("size", "")
        ).upper().strip()

        if pid not in PRODUCTS:
            raise ValueError(
                "Invalid product."
            )

        if qty < 1 or qty > 20:
            raise ValueError(
                "Invalid quantity."
            )

        if size not in ALLOWED_SIZES:
            raise ValueError(
                "Please select a valid size."
            )

        name, price = PRODUCTS[pid]

        total += price * qty

        items.append({
            "id": pid,
            "name": name,
            "size": size,
            "qty": qty,
            "price": price
        })

    return items, total


# ---------------------------------
# ORDER NUMBER
# ---------------------------------

def number():

    return (
        "AF"
        + datetime.now().strftime("%y%m%d")
        + secrets.token_hex(2).upper()
    )


# ---------------------------------
# SAVE ORDER
# ---------------------------------

def save(row):

    try:

        if ORDERS.exists():

            rows = json.loads(
                ORDERS.read_text()
            )

        else:

            rows = []

    except Exception:

        rows = []

    rows.append(row)

    ORDERS.write_text(
        json.dumps(
            rows,
            indent=2
        )
    )


# ---------------------------------
# HOME
# ---------------------------------

@app.get("/")
def home():

    return render_template(
        "index.html"
    )


# ---------------------------------
# RAZORPAY CREATE ORDER
# ---------------------------------

@app.post("/api/create-order")
def create_order():

    try:

        body = request.get_json(
            force=True
        )

        items, total = calc(
            body.get("cart")
        )

        order_number = number()

        amount = total * 100

        rp = client().order.create({

            "amount": amount,

            "currency": "INR",

            "receipt": order_number,

            "notes": {
                "aftr_order":
                    order_number
            }

        })


        save({

            "order_number":
                order_number,

            "status":
                "payment_pending",

            "created_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),

            "customer":
                body.get(
                    "customer",
                    {}
                ),

            "items":
                items,

            "total_rupees":
                total,

            "razorpay_order_id":
                rp["id"]

        })


        return jsonify(

            order_number=
                order_number,

            razorpay_order_id=
                rp["id"],

            amount=
                amount,

            currency=
                "INR",

            key_id=
                os.getenv(
                    "RAZORPAY_KEY_ID"
                )
        )


    except Exception as e:

        return jsonify(
            error=str(e)
        ), 400


# ---------------------------------
# VERIFY RAZORPAY PAYMENT
# ---------------------------------

@app.post("/api/verify-payment")
def verify():

    try:

        body = request.get_json(
            force=True
        )


        client().utility.verify_payment_signature({

            "razorpay_order_id":
                body[
                    "razorpay_order_id"
                ],

            "razorpay_payment_id":
                body[
                    "razorpay_payment_id"
                ],

            "razorpay_signature":
                body[
                    "razorpay_signature"
                ]

        })


        items, total = calc(
            body.get("cart")
        )


        save({

            "order_number":
                body.get(
                    "order_number"
                ),

            "status":
                "paid_verified",

            "verified_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),

            "customer":
                body.get(
                    "customer",
                    {}
                ),

            "items":
                items,

            "total_rupees":
                total,

            "razorpay_order_id":
                body[
                    "razorpay_order_id"
                ],

            "razorpay_payment_id":
                body[
                    "razorpay_payment_id"
                ]

        })


        return jsonify(
            ok=True
        )


    except razorpay.errors.SignatureVerificationError:

        return jsonify(
            error=
            "Payment signature verification failed. Order not marked paid."
        ), 400


    except Exception as e:

        return jsonify(
            error=str(e)
        ), 400


# ---------------------------------
# CASH ON DELIVERY
# ---------------------------------

@app.post("/api/cod-order")
def cod():

    try:

        body = request.get_json(
            force=True
        )

        items, total = calc(
            body.get("cart")
        )

        order_number = number()


        save({

            "order_number":
                order_number,

            "status":
                "cod_pending",

            "created_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),

            "customer":
                body.get(
                    "customer",
                    {}
                ),

            "items":
                items,

            "total_rupees":
                total

        })


        return jsonify(
            order_number=
                order_number
        )


    except Exception as e:

        return jsonify(
            error=str(e)
        ), 400


# ---------------------------------
# RUN
# ---------------------------------

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )
