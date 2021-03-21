import './App.css';
import { useState } from 'react';
import axios from 'axios';
import * as dotenv from "dotenv";
import path from "path";
import logo from "./assets/codingforall.png"
import donateUsPic from "./assets/donate-us.jfif" 

dotenv.config({ path: path.join(__dirname,'./env') });

function App() {
  const [inputAmount, setAmount] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState(null)
  const [radioChecked, setRadioChecked] = useState(0)

  function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

  let donateHandler = async () => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")
    const result = await axios.post("https://razorpay-nodejs-integration.herokuapp.com/api/payment", {
      amount: inputAmount * 100,
      currency: "INR",
      receipt: name.concat(inputAmount),
      payment_capture: 1
    }, {
      headers: {
        'content-type': 'application/json'
      }
    }).catch(err => alert(err))
    if(!res) {
      alert("Server error. Please check your internet connection");
      return;
    }
    if(result !== undefined) {
      const { amount, id: order_id, currency } = result.data.sub
      console.log(process.env.KEY_ID, "KEY_ID", amount)
      const options = {
        key: process.env.KEY_ID,
        amount,
        currency: currency,
        name,
        description: "Thanks for donating",
        image: { logo },
        order_id,
        handler: async response => {
          const data = {
            orderCreationId: order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          };
          const result = await axios.post("https://razorpay-nodejs-integration.herokuapp.com/api/payment/verify", data);
          console.log(result.data.msg)
        },
        prefill: {
          name,
          email,
          contact
        },
        notes: {
          Name: name,
          Email: email
        },
        theme: {
          color: "#3484D8"
        }
      };
      const paymentObject =  new window.Razorpay(options);
      paymentObject.open();
    } else alert("Please check your values.")
  // }
  }
  return (  
    <div className="App">
      <div className="Image-container">
        <img src={donateUsPic}/>
      </div>
      <form onSubmit={e => e.preventDefault()} className="App-payment-details">
        <div>
          <label>
          Please select an amount
          <select onChange={e => {
            console.log(e.target.value)
            if(e.target.value.startsWith("--Select")) {
              setAmount(0)
            }
            if(e.target.value == "₹2000") {
              setAmount(2000)
            }
            if(e.target.value == "₹5000") {
              setAmount(5000)
            }
            if(e.target.value == "Other") {
              const amount = prompt("Please enter the Amount you want to Donate")
              if(+amount) {
                setAmount(+amount)
              } else setAmount(0)
            }
          }}>
            <option>--Select Amount--</option>
            <option>₹2000</option>
            <option>₹5000</option>
            <option>Other</option>
          </select>
          </label>
        {/* </div>
        <div> */}
          <label>
          Name
          <input type="text" id="name" onChange={e => setName(e.target.value)} required/>
          </label>
          <label>
          Contact Number
            <input type="number" onChange={e => setContact(e.target.value)} required/>
          </label>
          <label>
          Email
          <input type="email" onChange={e => setEmail(e.target.value)} required/>
          </label>
        </div>
        <div>
          <button className="Donate-now" onClick={donateHandler}>Donate Now</button>
        </div>
      </form>
    </div>
  );
}

export default App;


