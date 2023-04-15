/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
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
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  );
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
});

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};
const store = null;
let newBill = new NewBill({
  document,
  onNavigate,
  store,
  localStorage: window.localStorage,
});

describe("Given I am connected as an employee", () => {
  describe("When I navigate to NewBill Page", () => {
    test("Then icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon).toBeTruthy();
      expect(mailIcon).toHaveClass("active-icon");
    });

    test("Then the form displays with the correct fields", () => {
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();

      const expenseType = screen.getByTestId("expense-type");
      expect(expenseType).toBeTruthy();

      const expenseName = screen.getByTestId("expense-name");
      expect(expenseName).toBeTruthy();

      const datePicker = screen.getByTestId("datepicker");
      expect(datePicker).toBeTruthy();

      const amount = screen.getByTestId("amount");
      expect(amount).toBeTruthy();

      const vat = screen.getByTestId("vat");
      expect(vat).toBeTruthy();

      const pct = screen.getByTestId("pct");
      expect(pct).toBeTruthy();

      const commentary = screen.getByTestId("commentary");
      expect(commentary).toBeTruthy();

      const file = screen.getByTestId("file");
      expect(file).toBeTruthy();

      const btnSubmit = screen.getByTestId("btn-submit");
      expect(btnSubmit).toBeTruthy();
    });
  });
  describe("When I am on NewBill Page and I click on input file and I select a image", () => {
    beforeEach(() => {
      newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
    });
    describe("When the image is in the correct format", () => {
      test("Then the image is selected and the name of the image appears", async () => {
        document.body.innerHTML = NewBillUI();
        const fileInput = screen.getByTestId("file");

        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        fileInput.addEventListener("change", handleChangeFile);

        fireEvent.change(fileInput, {
          target: {
            files: [
              new File(["facture"], "facture.png", { type: "image/png" }),
            ],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(newBill.file).toBe(fileInput.files[0]);
      });
    });

    describe("When the image is in the wrong format", () => {
      test("Then the image is not selected", async () => {
        document.body.innerHTML = NewBillUI();
        const fileInput = screen.getByTestId("file");

        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        fileInput.addEventListener("change", handleChangeFile);

        fireEvent.change(fileInput, {
          target: {
            files: [
              new File(["facture"], "facture.pdf", {
                type: "application/pdf",
              }),
            ],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(newBill.file).toBe(null);
      });
    });
  });

  describe("When I am on NewBill Page and I click on submit button", () => {
    beforeAll(() => {
      document.body.innerHTML = "";
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    afterAll(() => {
      window.onNavigate(ROUTES_PATH.NewBill);
    });

    beforeEach(() => {
      screen.getByTestId("expense-type").value = bills[0].type;
      screen.getByTestId("expense-name").value = "New bill test";
      screen.getByTestId("datepicker").value = bills[0].date;
      screen.getByTestId("amount").value = bills[0].amount;
      screen.getByTestId("vat").value = bills[0].vat;
      screen.getByTestId("pct").value = bills[0].pct;
      screen.getByTestId("commentary").value = bills[0].commentary;
      screen.getByTestId("error-message-form").innerHTML = "";
    });

    describe("When the name of the expense is incorrectly entered", () => {
      test("Then, an error message is displayed", async () => {
        screen.getByTestId("expense-name").value = "";
        const form = screen.getByTestId("form-new-bill");
        fireEvent.submit(form);
        await waitFor(() =>
          screen.getByText("Veuillez renseigner tout les champs")
        );
        expect(
          screen.getByText("Veuillez renseigner tout les champs")
        ).toBeTruthy();
      });
    });

    describe("When the date of the expense is incorrectly entered", () => {
      test("Then, an error message is displayed", async () => {
        screen.getByTestId("datepicker").value = "";
        const form = screen.getByTestId("form-new-bill");
        fireEvent.submit(form);
        await waitFor(() =>
          screen.getByText("Veuillez renseigner tout les champs")
        );
        expect(
          screen.getByText("Veuillez renseigner tout les champs")
        ).toBeTruthy();
      });
    });

    describe("When the amount of the expense is incorrectly entered", () => {
      test("Then, an error message is displayed", async () => {
        screen.getByTestId("amount").value = "";
        const form = screen.getByTestId("form-new-bill");
        fireEvent.submit(form);
        await waitFor(() =>
          screen.getByText("Veuillez renseigner tout les champs")
        );
        expect(
          screen.getByText("Veuillez renseigner tout les champs")
        ).toBeTruthy();
      });
    });

    describe("When all the fields are correctly filled", () => {
      test("Then, the bill is created and I am redirected to the Bills Page", async () => {
        const fileInput = screen.getByTestId("file");
        fireEvent.change(fileInput, {
          target: {
            files: [
              new File(["facture"], "facture.png", { type: "image/png" }),
            ],
          },
        });
        const form = screen.getByTestId("form-new-bill");
        fireEvent.submit(form);
        await waitFor(() => screen.getByText("Mes notes de frais"));
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      });
    });
  });
});

// test d'intégration POST
describe("Given I am a user connected as Employee on NewBill Page ", () => {
  describe("When I click on the submit button with the correct data", () => {
    beforeEach(async () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      document.body.innerHTML = "";
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      screen.getByTestId("expense-type").value = bills[0].type;
      screen.getByTestId("expense-name").value = "New bill test";
      screen.getByTestId("datepicker").value = bills[0].date;
      screen.getByTestId("amount").value = bills[0].amount;
      screen.getByTestId("vat").value = bills[0].vat;
      screen.getByTestId("pct").value = bills[0].pct;
      screen.getByTestId("commentary").value = bills[0].commentary;
      fireEvent.change(screen.getByTestId("file"), {
        target: {
          files: [
            new File(["facture"], "facture.png", {
              type: "image/png",
            }),
          ],
        },
      });

      jest.spyOn(mockStore, "bills");
    });

    test("create new file", async () => {
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });

    describe("When an error occurs on API", () => {
      test("fetches bills from an API and fails with 404 message error", async () => {
        const form = screen.getByTestId("form-new-bill");

        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              const error = new Error("Erreur 404");
              error.status = 404;
              return Promise.reject(error);
            },
          };
        });
        fireEvent.submit(form);

        await waitFor(() => screen.getByText("Erreur 404"));
        const errorMessage = screen.getByTestId("error-message-form");
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.innerHTML).toBe("Erreur 404");
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      });

      test("fetches bills from an API and fails with 500 message error", async () => {
        const form = screen.getByTestId("form-new-bill");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              const error = new Error("Erreur 500");
              error.status = 500;
              return Promise.reject(error);
            },
          };
        });
        fireEvent.submit(form);
        await waitFor(() => screen.getByText("Erreur 500"));
        const errorMessage = screen.getByTestId("error-message-form");
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.innerHTML).toBe("Erreur 500");
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      });
    });
  });
});
