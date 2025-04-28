# Digital Naryn

A comprehensive mobile application for discovering and exploring local businesses and services in Naryn city. Built with React Native for the frontend and Django for the backend.

## 📱 Features

- Discover local businesses and services
- Real-time business information
- User-friendly interface
- Location-based services

## 🛠️ Tech Stack

### Frontend

- React Native
- Expo
- TypeScript

### Backend

- Django
- Django REST Framework
- PostgreSQL
- [Add other backend technologies]

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Expo CLI

### Installation

1. Clone the repository:

```bash
git clone [your-repository-url]
cd digital-naryn
```

2. Frontend Setup:

```bash
cd frontend
npm install
```

3. Backend Setup:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### ⚡️ Environment & API URL Setup (IMPORTANT!)

To make the app work on your emulator, simulator, or real device, you must set the correct API URL in your frontend `.env` file:

1. **Create a `.env` file in the `frontend/` directory:**

```
# For Android emulator
API_URL_ANDROID=http://10.0.2.2:8000

# For iOS simulator
API_URL_IOS=http://127.0.0.1:8000

# For real devices (replace with your computer's local IP address)
# API_URL_ANDROID=http://192.168.1.201:8000
# API_URL_IOS=http://192.168.1.201:8000
```

- To find your computer's local IP, run `ifconfig` (Mac/Linux) or `ipconfig` (Windows) and look for something like `192.168.x.x`.
- Make sure your phone and computer are on the same WiFi network.
- If you want to run on a real device, uncomment and set both URLs to your computer's IP.


3. **Start your backend with:**

   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

   - This makes your backend accessible to emulators, simulators, and real devices.

4. **Restart Expo with cache clear after changing `.env`:**
   ```bash
   npx expo start -c
   ```

### Local Development

#### Frontend Development

```bash
cd frontend
npx expo start
```

## 📸 Screenshots

<div align="center">
  <h3>App Screenshots</h3>
  
  <table>
    <tr>
      <td><img src="frontend/screenshots/simulator_screenshot_7BC36ED1-5455-4D2B-AA71-76745DAE559A.png" alt="Home Screen" width="200"/><br/>Home Screen</td>
      <td><img src="frontend/screenshots/simulator_screenshot_86D0E1D3-572C-4981-88B9-33B33986F886.png" alt="Business List" width="200"/><br/>Business List</td>
      <td><img src="frontend/screenshots/simulator_screenshot_89EB0FC6-7AC0-4514-8A7D-BDD674DCB8FD.png" alt="Business Details" width="200"/><br/>Business Details</td>
    </tr>
    <tr>
      <td><img src="frontend/screenshots/simulator_screenshot_4145C69A-8DE5-40FF-8E81-A1399EA48095.png" alt="Map View" width="200"/><br/>Map View</td>
      <td><img src="frontend/screenshots/simulator_screenshot_828B867E-11B9-4F8A-A68B-95656B51F17C.png" alt="Search" width="200"/><br/>Search</td>
      <td><img src="frontend/screenshots/simulator_screenshot_00338DB0-D7DB-428B-A521-620B19CEF49E.png" alt="Categories" width="200"/><br/>Categories</td>
    </tr>
    <tr>
      <td><img src="frontend/screenshots/simulator_screenshot_350D80FD-077A-4691-A663-572D2813CB24.png" alt="Profile" width="200"/><br/>Profile</td>
      <td><img src="frontend/screenshots/simulator_screenshot_CFABE47C-9911-47E5-82E1-94B444992A03.png" alt="Settings" width="200"/><br/>Settings</td>
      <td><img src="frontend/screenshots/simulator_screenshot_7C99AD7F-5FF8-44C7-8532-EDE06B94AA1C.png" alt="Notifications" width="200"/><br/>Notifications</td>
    </tr>
  </table>
</div>

## 🌐 Live Demo

### Backend Server

👉 [Access the live backend server](http://157.230.109.162:8000/)
