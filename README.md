# 🍽️ Smart Meal

A budget-first meal planning web application designed for students. Smart Meal helps users generate affordable meal plans, discover recipes, and manage grocery lists — all powered by intelligent decision-making algorithms.

---

## 📦 Stack

* **Frontend & Backend:** Next.js
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Database:** Firebase
* **Algorithm:** Hybrid AHP + TOPSIS (Multi-Criteria Decision Making)

---

## ✨ Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🎯 Features

* 💸 **Budget-Based Meal Planning** — Generate meals based on a defined budget
* 🧠 **Smart Recommendations** — Uses AHP + TOPSIS algorithms to rank meals
* 🛒 **Shopping List Generator** — Automatically extracts ingredients
* 📥 **Recipe Downloads** — Save meals for offline use
* 🌍 **Global Meal Options** — Discover meals across different cuisines
* 📊 **Health Insights** — Basic nutritional awareness for better choices

---

## 🤖 How it Works

Smart Meal uses a **hybrid decision-making model** combining:

### 1. AHP (Analytic Hierarchy Process)

* Assigns weights to criteria such as:

  * Cost
  * Nutrition
  * Availability
  * Preference

### 2. TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)

* Ranks meals based on:

  * Closest to ideal solution (best case)
  * Farthest from worst case

This ensures users get **optimal meal recommendations** based on real constraints — especially budget.

---

## 🧮 Decision Model Flow

1. User inputs:

   * Budget
   * Preferences
   * Dietary needs

2. AHP computes **criteria weights**

3. TOPSIS:

   * Normalizes meal data
   * Applies weights
   * Calculates ranking scores

4. System returns:

   * Ranked meal options
   * Best-fit recommendations

---


---

## 🎹 Usage

* Enter your **budget**
* Select **meal preferences**
* Generate a **personalized meal plan**
* View **ranked results**
* Export recipes or shopping lists

---

## 🚀 Future Improvements

* 🧾 Advanced nutrition tracking
* 🤖 AI-based meal personalisation
* 📱 Mobile app version (React Native / Expo)
* 🧑‍🤝‍🧑 User accounts & saved plans
* 📈 Analytics dashboard

---

## 👤 Author

**Tosin O.**

* GitHub: https://github.com/Tosin-O
* Instagram: @codejourneywithtosin

---

## 📀 Preview

*Add screenshots or demo videos here*
