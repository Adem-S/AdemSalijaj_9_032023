import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    if (formNewBill) formNewBill.addEventListener("submit", this.handleSubmit);

    const file = this.document.querySelector(`input[data-testid="file"]`);
    if (file) file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    this.file = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    if (file) {
      const fileTypeAccepted = ["image/png", "image/jpg", "image/jpeg"];
      const fileType = file.type;
      if (fileTypeAccepted.includes(fileType)) {
        const filePath = e.target.value.split(/\\/g);
        const fileName = filePath[filePath.length - 1];
        this.fileName = fileName;
        this.file = file;
      } else {
        console.log("error file type ");
      }
    } else {
      console.log("error no file");
    }
  };

  sendFile = () => {
    return new Promise((resolve, reject) => {
      if (this.file) {
        const formData = new FormData();
        const email = JSON.parse(localStorage.getItem("user")).email;
        formData.append("file", this.file);
        formData.append("email", email);

        this.store
          .bills()
          .create({
            data: formData,
            headers: {
              noContentType: true,
            },
          })
          .then(({ filePath, key }) => {
            this.billId = key;
            this.fileUrl = filePath;
            resolve({ status: "sucess" });
          })
          .catch((error) => {
            resolve({ error });
            console.error(error);
          });
      } else {
        console.log("error no file");
        resolve({ error: "error no file" });
      }
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );

    const response = await this.sendFile();

    if (response.error) {
      console.log("error");
      return false;
    } else {
      const email = JSON.parse(localStorage.getItem("user")).email;

      const amount = parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      );
      const pct =
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20;

      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`)
          .value,
        name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount,
        date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: parseInt(
          e.target.querySelector(`input[data-testid="vat"]`).value ||
            (amount / 100) * pct
        ),
        pct,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
          .value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: "pending",
      };
      this.updateBill(bill);
    }
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
