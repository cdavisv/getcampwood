<!-- Readme Template from: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>



<div align="center">
  <a href="https://github.com/cdavisv/getcampwood/">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Get Campwood</h3>

  <p align="center">
    A microservice-based firewood finder that helps users locate, post, and manage firewood listings for camping or home use.  
    Users can manage accounts, search via maps, and perform CRUD operations on firewood locations.
    <br />
    <a href="https://github.com/cdavisv/getcampwood/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/cdavisv/getcampwood/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

---

## About The Project

Get Campwood is a distributed Node.js application built around microservices:

- **Gateway / Main Web App (Node.js + Express + EJS/Handlebars)**  
- **Microservice B: Map UI Service**  
- **Microservice C: Geolocation Service**  
- **Microservice D: Firewood Location CRUD Service**  

Each service runs independently, communicates over internal API routes, and can be deployed on separate nodes.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Built With

* Node.js  
* Express  
* MongoDB  
* Mongoose  
* Leaflet.js (map UI)  
* Nginx / Reverse Proxy (optional)  
* Docker (optional)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Getting Started

Follow the instructions below to run the Get Campwood app and all microservices locally.

### Prerequisites

Install the following:

* Node.js (version 18 or higher)
* npm  
* MongoDB Community Edition or MongoDB Atlas connection string

To verify Node installation:

```sh
node -v
npm -v
```

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```


### Project Structure
```sh
getcampwood/
│
├── gateway/                  # Main web app (UI + routing)
├── locations-service/        # CRUD microservice (firewood locations)
├── geolocation-service/      # Reverse geocoding and coordinate utilities
├── map-service/              # Map UI microservice (Leaflet front-end provider)
└── shared/                   # Shared utils, config (optional)
```


1. Clone the repository
git clone https://github.com/cdavisv/getcampwood.git
cd getcampwood

2. Install dependencies for each microservice
### Gateway (Main Node.js App)
```sh
cd gateway
npm install
```
### Location CRUD Service
```sh
cd ../locations-service
npm install
```
### Geolocation Service
```sh
cd ../geolocation-service
npm install
```
### Map UI Service
```sh
cd ../map-service
npm install
```

## Environment Configuration

Each service requires an .env file. Examples:

### gateway/.env
```sh
PORT=3000
LOCATIONS_SERVICE_URL=http://localhost:4000
GEO_SERVICE_URL=http://localhost:5000
MAP_SERVICE_URL=http://localhost:6000
MONGO_URI=mongodb://localhost:27017/getcampwood
SESSION_SECRET=your-session-secret
```
### locations-service/.env
```sh
PORT=4000
MONGO_URI=mongodb://localhost:27017/getcampwood_locations
```

### geolocation-service/.env
```sh
PORT=5000
API_KEY=your_geolocation_api_key   # if using external service
```
```sh
map-service/.env
PORT=6000
```
<p align="right">(<a href="#readme-top">back to top</a>)</p>
Running the Services

## Run each microservice in its own terminal window.

1. Start the CRUD Locations Service
cd locations-service
npm start


#### Runs at:

http://localhost:4000

2. Start the Geolocation Service
```sh
cd geolocation-service
npm start
```

#### Runs at:
```sh
http://localhost:5000
```
3. Start the Map UI Service
```sh
cd map-service
npm start
```

#### Runs at:
```sh
http://localhost:6000
```

4. Start the Gateway App
```sh
cd gateway
npm start
```

#### Runs at:
```sh
http://localhost:3000
```
## Usage

Once all services are running:

Visit http://localhost:3000

Create an account

Add a firewood listing

View listings on the integrated map

Use geolocation tools to fetch coordinates

Edit or delete your posts (CRUD)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

User messaging system

Image uploads for listings

Mobile app client

Admin dashboard

AI-based location quality scoring

Offline caching (PWA)

See the open issues

for more.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Contributing

Contributions are welcome!
```sh
Fork the project
```
Create your feature branch
```sh
git checkout -b feature/my-feature
```

Commit your changes
```sh
git commit -m "Added my feature"
```

Push to your branch
```sh
git push origin feature/my-feature
```

Open a Pull Request

<a href="https://github.com/cdavisv/getcampwood/graphs/contributors"> <img src="https://contrib.rocks/image?repo=cdavisv/getcampwood" /> </a> <p align="right">(<a href="#readme-top">back to top</a>)</p>

### License

Distributed under the a custom proprietary "Look but Do Not Touch" License.
See LICENSE for details.

Contact

Charles Davis
Project Link: https://github.com/cdavisv/getcampwood

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!-- MARKDOWN LINKS & IMAGES -->
Copyright (c) 2025 Charles Davis

