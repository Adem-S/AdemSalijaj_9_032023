import store from "./Store.js";
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js";
import Bills from "../containers/Bills.js";
import NewBill from "../containers/NewBill.js";
import Dashboard from "../containers/Dashboard.js";

import BillsUI from "../views/BillsUI.js";
import DashboardUI from "../views/DashboardUI.js";
import NewBillUI from "../views/NewBillUI.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

export default () => {
  const rootDiv = document.getElementById("root");
  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname });

  let user;
  user = JSON.parse(localStorage.getItem("user"));
  if (typeof user === "string") {
    user = JSON.parse(user);
  }

  let destination = user
    ? user.type === "Employee"
      ? ROUTES_PATH["Bills"]
      : ROUTES_PATH["Dashboard"]
    : ROUTES_PATH["Login"];

  window.onNavigate = (pathname) => {
    user = JSON.parse(localStorage.getItem("user"));
    if (typeof user === "string") {
      user = JSON.parse(user);
    }

    window.history.pushState({}, pathname, window.location.origin + pathname);
    if (pathname === ROUTES_PATH["Login"]) {
      rootDiv.innerHTML = ROUTES({ pathname });
      document.body.style.backgroundColor = "#0E5AE5";
      new Login({
        document,
        localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });
    } else if (pathname === ROUTES_PATH["Bills"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      if (divIcon1 && divIcon2) {
        divIcon1.classList.add("active-icon");
        divIcon2.classList.remove("active-icon");
      }
      const bills = new Bills({ document, onNavigate, store, localStorage });
      bills
        .getBills()
        .then((data) => {
          if (user && user.type !== "Employee") {
            rootDiv.innerHTML = ROUTES({
              pathname,
              error: "unauthorized action",
            });
          } else {
            rootDiv.innerHTML = BillsUI({ data });
            const divIcon1 = document.getElementById("layout-icon1");
            const divIcon2 = document.getElementById("layout-icon2");
            divIcon1.classList.add("active-icon");
            divIcon2.classList.remove("active-icon");
            new Bills({ document, onNavigate, store, localStorage });
          }
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });
    } else if (pathname === ROUTES_PATH["NewBill"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      if (!user || (user && user.type !== "Employee")) {
        rootDiv.innerHTML = ROUTES({ pathname, error: "unauthorized action" });
      } else {
        rootDiv.innerHTML = NewBillUI();
        const divIcon1 = document.getElementById("layout-icon1");
        const divIcon2 = document.getElementById("layout-icon2");
        divIcon1.classList.remove("active-icon");
        divIcon2.classList.add("active-icon");
        new NewBill({ document, onNavigate, store, localStorage });
      }
    } else if (pathname === ROUTES_PATH["Dashboard"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      const bills = new Dashboard({
        document,
        onNavigate,
        store,
        bills: [],
        localStorage,
      });
      bills
        .getBillsAllUsers()
        .then((bills) => {
          if (user && user.type !== "Admin") {
            rootDiv.innerHTML = ROUTES({
              pathname,
              error: "unauthorized action",
            });
          } else {
            rootDiv.innerHTML = DashboardUI({ data: { bills } });
            new Dashboard({ document, onNavigate, store, bills, localStorage });
          }
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });
    }
  };

  window.onpopstate = (e) => {
    let newDestination = PREVIOUS_LOCATION ? PREVIOUS_LOCATION : destination;
    onNavigate(newDestination);
  };

  if (window.location.pathname === "/" && window.location.hash === "") {
    if (typeof jest === "undefined") onNavigate(destination);
  } else if (window.location.hash !== "") {
    if (window.location.hash === ROUTES_PATH["Bills"]) {
      onNavigate(ROUTES_PATH["Bills"]);
    } else if (window.location.hash === ROUTES_PATH["NewBill"]) {
      onNavigate(ROUTES_PATH["NewBill"]);
    } else if (window.location.hash === ROUTES_PATH["Dashboard"]) {
      onNavigate(ROUTES_PATH["Dashboard"]);
    } else {
      onNavigate(destination);
    }
  }

  return null;
};
