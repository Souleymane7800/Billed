/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import { mockedBills } from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

      expect(windowIcon.classList.contains('active-icon')).toBe(true);

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  // new bill init
  test("Then New Bill Constructor", () => {
    const newBills = new Bills({ document, onNavigate: jest.fn(), store: mockedBills });
    expect(newBills.document).toBe(document);
    expect(newBills.onNavigate).toBeDefined();
    expect(newBills.store).toBe(mockedBills)
  })
  // navigate on new bill page
  test("Then the click on 'New Bill' should lead to navigation to the NewBill page.", async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee'}));

    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);

    router();
    await window.onNavigate(ROUTES_PATH.Bills);

    // Attendez l'apparition du bouton 'New Bill'
    await waitFor(() => screen.getByTestId('btn-new-bill'));

    // Simulez un clic sur le bouton 'New Bill' à l'aide de fireEvent.click
    fireEvent.click(screen.getByTestId('btn-new-bill'));

    // Vérifiez si la navigation vers la page NewBill s'est produite
    await waitFor(() => {
    // Check if the URL contains the expected part
      expect(window.location.href).toMatch(/#employee\/bill\/new/);
    });
  });

  // handleClickIconEye
  test("When the icon is clicked, call handleClickIconEye", () => {
    const newBills = new Bills({ document, onNavigate: jest.fn(), store: mockedBills });
    const mockedIcon = document.createElement('div');
    mockedIcon.setAttribute('data-bill-url', 'mockedBillUrl');

    document.body.appendChild(mockedIcon);

    // Mock handleClickIconEye
    newBills.handleClickIconEye = jest.fn();
    window.$.fn.modal = jest.fn();

    mockedIcon.addEventListener('click', () => {newBills.handleClickIconEye(mockedIcon)});

    // Trigger a click event on the icon
    fireEvent.click(mockedIcon);

    // HandleClickIconEye is called
    expect(newBills.handleClickIconEye).toHaveBeenCalledWith(mockedIcon);

  });

  test("handleClickIconEye show modal", () => {
    const newBills = new Bills({ document, onNavigate: jest.fn(), store: mockedBills });
    const mockedIcon = document.createElement('div');
    mockedIcon.setAttribute('data-bill-url', 'mockedBillUrl');

    window.$.fn.modal = jest.fn();
    newBills.handleClickIconEye(mockedIcon);

    expect(window.$.fn.modal).toHaveBeenCalledWith('show');

  });

  test("getBills from the mock store", async () => {

    const mockedBills = {
      bills: jest.fn().mockReturnValue({
        list: jest.fn().mockResolvedValue([])
      })
    };

    const billElement = new Bills({ document, onNavigate: jest.fn(), store: mockedBills });
    const getBillsPromise = billElement.getBills();

    await getBillsPromise;

    // Check if the mockehBills is called
    expect(mockedBills.bills).toHaveBeenCalledTimes(1);

    // Get the bills from the mockedBills after the promise
    const mockBillStorePromise = mockedBills.bills().list();
  
    await expect(mockBillStorePromise).resolves.toEqual([]);

    // Get the bills from the mockedBills after the promise
    const mockBillStore = await mockBillStorePromise;
    
    // Verify getBills is a array
    expect(mockBillStore).toBeTruthy();

  });

  test("getBills from the mock store with error", async () => {
    const mockError = new Error("Simulated error in list method");

    // const mockList = jest.fn().mockRejectedValue(mockError);
    const mockedBillsError = {
      bills: jest.fn(() => ({
        list: jest.fn(() => Promise.reject(mockError)),
      }))
    };

    const billElement = new Bills({ document, onNavigate, store: mockedBillsError });

    try {
      // Appel de la méthode getBills
      await billElement.getBills();

    } catch (error) {
      // Vérification que l'erreur est bien celle attendue
      expect(error).toBe(mockError);
    }
  });
});

// faire un describe
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
  
    test("then bills from an API and fails with 404 message error", async () => {
      const mockedBills = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue([])
        })
      };

      mockedBills.bills(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();

    });

    test("then messages from an API and fails with 500 message error", async () => {
      const mockedBills = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue([])
        })
      };
      
      mockedBills.bills(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const MyMessage = await screen.getByText(/Erreur 500/);
      expect(MyMessage).toBeTruthy();

    });
  });
});

// test d'intégration GET
// describe("Given I am a user connected as Admin", () => {
//   describe("When I navigate to Dashboard", () => {
//     test("fetches bills from mock API GET", async () => {
//       localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }));
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH.Dashboard)
//       await waitFor(() => screen.getByText("Validations"))
//       const contentPending  = await screen.getByText("En attente (1)")
//       expect(contentPending).toBeTruthy()
//       const contentRefused  = await screen.getByText("Refusé (2)")
//       expect(contentRefused).toBeTruthy()
//       expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
//     })
//   describe("When an error occurs on API", () => {
//     beforeEach(() => {
//       jest.spyOn(mockStore, "bills")
//       Object.defineProperty(
//           window,
//           'localStorage',
//           { value: localStorageMock }
//       )
//       window.localStorage.setItem('user', JSON.stringify({
//         type: 'Admin',
//         email: "a@a"
//       }))
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.appendChild(root)
//       router()
//     })
//     test("fetches bills from an API and fails with 404 message error", async () => {

//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 404"))
//           }
//         }})
//       window.onNavigate(ROUTES_PATH.Dashboard)
//       await new Promise(process.nextTick);
//       const message = await screen.getByText(/Erreur 404/)
//       expect(message).toBeTruthy()
//     })

//     test("fetches messages from an API and fails with 500 message error", async () => {

//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 500"))
//           }
//         }})

//       window.onNavigate(ROUTES_PATH.Dashboard)
//       await new Promise(process.nextTick);
//       const message = await screen.getByText(/Erreur 500/)
//       expect(message).toBeTruthy()
//     })
//   })

//   })
// })
// 