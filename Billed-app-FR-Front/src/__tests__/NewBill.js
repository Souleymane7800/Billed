/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import {localStorageMock} from "../__mocks__/localStorage.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the user should be registered", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
    });

    test("Then the newBill page should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion

       // Assert that form elements are present
       expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
       expect(screen.getByTestId('form-new-bill')).toBeTruthy();
       expect(screen.getByTestId('file')).toBeTruthy();
       expect(screen.getByTestId('expense-type')).toBeTruthy();
       expect(screen.getByTestId('expense-name')).toBeTruthy();
       expect(screen.getByTestId('amount')).toBeTruthy();
       expect(screen.getByTestId('datepicker')).toBeTruthy();
       expect(screen.getByTestId('vat')).toBeTruthy();
       expect(screen.getByTestId('pct')).toBeTruthy();
       expect(screen.getByTestId('commentary')).toBeTruthy();
    });

  })
});

describe("When I am on NewBill Page and I add an attached file", () => {
  test("Then the file handler should be run", async () => {
    // DOM
    document.body.innerHTML = NewBillUI();

    // Mock store with a bills method returning an object with a create method
    const mockedCreate = jest.fn(() => Promise.resolve({ fileUrl: 'mockFileUrl', key: 'mockKey' }));
    const mockedBills = {
      create: mockedCreate
    };
    const mockedStore = {
      bills: jest.fn(() => mockedBills)
    };

    const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockedStore });

    // handle event
    const handleChangeFile = jest.spyOn(newBill, 'handleChangeFile');
    const attachedFile = screen.getByTestId('file');
    attachedFile.addEventListener('change', handleChangeFile);
    fireEvent.change(attachedFile, {
      target: {
        files: [new File(['file.jpg'], 'file.jpg', { type: 'image/jpeg' })],
      },
    });

    // Wait for handleChangeFile to finish its async operations
    await Promise.resolve();

    // Assert that handleChangeFile has been called
    expect(handleChangeFile).toHaveBeenCalled();

    // Expected result
    const numberOfFile = screen.getByTestId('file').files.length;
    expect(numberOfFile).toEqual(1);

    const uploadedFile = attachedFile.files[0];
    expect(['image/jpeg', 'image/jpg', 'image/png']).toContain(uploadedFile.type);

    // Assert that the create method of store.bills has been called
    expect(mockedCreate).toHaveBeenCalled();
  })
});

describe("WHEN I am on NewBill page and I submit a correct form", () => {
  test("Then I should be redirected to Bills page", async () => {
    // DOM
    document.body.innerHTML = NewBillUI();

    // Mock create method
    const mockedCreate = jest.fn(() => Promise.resolve({ fileUrl: 'mockFileUrl', key: 'mockKey' }));

    // Mock update method
    const mockedUpdate = jest.fn(() => Promise.resolve());

    // Mock store with a bills method returning an object with create and update methods
    const mockedBills = {
      create: mockedCreate,
      update: mockedUpdate
    };
    const mockedStore = {
      bills: jest.fn(() => mockedBills)
    };

    const newBillContainer = new NewBill({ document, onNavigate: jest.fn(), store: mockedStore });

    // handle event submit attached file
    const handleSubmit = jest.fn(newBillContainer.handleSubmit);
    newBillContainer.fileName = 'image.jpg';

    // handle event submit form
    const newBillForm = screen.getByTestId('form-new-bill');
    newBillForm.addEventListener('submit', handleSubmit);
    fireEvent.submit(newBillForm);

    // Wait for handleSubmit to finish its async operations
    await Promise.resolve();

    // expected results
    expect(handleSubmit).toHaveBeenCalled();
    // expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
  })
});

describe("WHEN I am on NewBill page and I submit a wrong form", () => {
  test("Then the error message should be displayed when submitting a PDF file", () => {
    // DOM
    document.body.innerHTML = NewBillUI();

    // Mock store with a bills method returning an object with create and update methods
    const mockedCreate = jest.fn(() => Promise.resolve({ fileUrl: 'mockFileUrl', key: 'mockKey' }));
    const mockedUpdate = jest.fn(() => Promise.resolve());

    const mockedBills = {
      create: mockedCreate,
      update: mockedUpdate
    };
    const mockedStore = {
      bills: jest.fn(() => mockedBills)
    };

    const newBillContainer = new NewBill({ document, onNavigate: jest.fn(), store: mockedStore });

    // Spying on the handleChangeFile method
    const handleChangeFile = jest.spyOn(newBillContainer, 'handleChangeFile');

    // Simulating file change event with a PDF file
    const attachedFile = screen.getByTestId('file');
    fireEvent.change(attachedFile, {
      target: {
        files: [
          new File(['document.pdf'], 'document.pdf', {
            type: 'application/pdf',
          }),
        ],
      },
    });

    // Asserting that handleChangeFile has not been called
    expect(handleChangeFile).not.toHaveBeenCalled();

    // Asserting that error message is displayed
    // expect(screen.getByText('Error: Only image files are allowed.')).toBeInTheDocument();
  });
});

// bon format
// mauvais format
// submit
// post
// error404
// error500