/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import "@testing-library/jest-dom/extend-expect";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({ type: "Employee", email: "a@a" })
  );
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.Bills);
});

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};
const store = null;

let billsPage = new Bills({
  document,
  onNavigate,
  store,
  bills,
  localStorage: window.localStorage,
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toBeTruthy();
      expect(windowIcon).toHaveClass("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then bills appear with the correct form data", () => {
      const table = screen.getByTestId("tbody");
      expect(table).toBeTruthy();

      const rows = screen.getAllByTestId("tr");
      expect(rows).toBeTruthy();
      expect(rows).toHaveLength(4);

      const firstBill = rows[0];
      expect(firstBill).toBeTruthy();

      expect(firstBill.children[0].textContent).toBe("Hôtel et logement");
      expect(firstBill.children[1].textContent).toBe("encore");
      expect(firstBill.children[2].textContent).toBe("2004-04-04");
      expect(firstBill.children[3].textContent).toBe("400 €");
      expect(firstBill.children[4].textContent).toBe("pending");
    });
  });

  describe("When I am on Bills Page and I click on the icon eye of the first bill", () => {
    test("A modal should open", () => {
      const eye = screen.getAllByTestId("icon-eye")[0];

      const handleClickIcon = jest.fn(() => billsPage.handleClickIconEye(eye));

      eye.addEventListener("click", handleClickIcon);
      userEvent.click(eye);

      expect(handleClickIcon).toHaveBeenCalled();

      const modale = screen.getByTestId("modaleFile");
      expect(modale).toBeTruthy();
    });
  });
  describe("When I am on Bills Page and I click on the new bill btn", () => {
    test("Then, I should be sent to new bill page", () => {
      const newBillBtn = screen.getByTestId("btn-new-bill");
      const handleClickBtn = jest.fn(billsPage.handleClickNewBill);
      newBillBtn.addEventListener("click", handleClickBtn);
      userEvent.click(newBillBtn);
      expect(handleClickBtn).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
    router();
    window.onNavigate(ROUTES_PATH.Bills);
    jest.spyOn(mockStore, "bills");
  });

  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const contentPending = screen.getAllByText("En attente");
      expect(contentPending).toBeTruthy();
      expect(contentPending).toHaveLength(1);
      const contentRefused = screen.getAllByText("Refusé");
      expect(contentRefused).toBeTruthy();
      expect(contentRefused).toHaveLength(2);
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches bills from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
