# AFTR + Razorpay

## Setup
1. Open this folder in VS Code.
2. Open Terminal and run: `pip install -r requirements.txt`
3. Copy `.env.example` to a new file named `.env`.
4. Put your Razorpay TEST Key ID and Key Secret into `.env`.
5. Run: `python app.py`
6. Open `http://127.0.0.1:5000`

Do not use Live Server for this version; Flask serves the frontend and payment API together.

## Security
- Never put the Key Secret in HTML or JavaScript.
- The backend recalculates prices from its own product list.
- A Razorpay Order is created server-side.
- Successful checkout is only marked paid after server-side signature verification.
- Orders are saved to `orders.json` for this starter build.

## Before production
Use HTTPS, a real database, Razorpay webhooks, inventory checks, and run Flask without debug mode.
