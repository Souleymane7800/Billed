/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import {localStorageMock} from "../__mocks__/localStorage.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // Set up localStorage
  localStorage.setItem("user", '{"email" : "user@email.com"}');

  test("Then the user should be registered", () => {
    // Récupération des données utilisateur depuis le localStorage
    const userString = localStorage.getItem("user");
    const userObject = userString ? JSON.parse(userString) : null;

    // Expect
    const expectedUser = { email: 'user@email.com' };

    expect(userObject).toEqual(expectedUser);
  });
    test("Then the user should be registered", () => {

      const userString = localStorage.getItem("user");
      const userObject = userString ? JSON.parse(userString) : null;

      // Expect
      const expectedUser = { email: 'user@email.com' };

      expect(userObject).toEqual(expectedUser);
      
    });

    test("Then the newBill page should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

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

  describe("When I am on NewBill Page and I add an attached good format file", () => {
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
  
      // Expected result
      const numberOfFile = screen.getByTestId('file').files.length;
      expect(numberOfFile).toEqual(1);

    })
  });

  describe("WHEN I am on NewBill page and I submit a wrong attached file format", () => {
    test("Then the error message should be displayed when submitting a PDF file", async () => {
      // DOM setup
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
    
      // Expect that handleChangeFile has not been called
      expect(handleChangeFile).not.toHaveBeenCalled();
  
      // Waiting for handleChangeFile 
      await Promise.resolve();
  
      const errorMessage = await screen.findByTestId('errorMessage');
  
      // expect
      expect(errorMessage.textContent).toEqual('Veuillez sélectionner un fichier au format (.jpg) ou (.jpeg) ou (.png)');
    });
  });

  describe('Given I am connected as an employee', () => {
    describe('When I am on NewBill Page and submit the form', () => {
      test('Then it should generate a new bill', () => {
        // Set up localStorage
        localStorageMock.setItem("user", '{"email" : "user@email.com"}');
        

        // Mocking data
        const mockElementById = jest.fn().mockReturnValue({});
        const goodFormatFile = new File(['img'], 'image.png', { type: 'image/png' });
        const mockUpdate = jest.fn().mockResolvedValue({});

        const mockDocument = {
          querySelector: (selector) => {
            if (selector === 'input[data-testid="file"]') {
              return {
                files: [goodFormatFile],
                addEventListener: jest.fn(),
              };
            } else {
              return { addEventListener: jest.fn() };
            }
          },
          getElementById: mockElementById,
        };

        const mockStore = {
          bills: () => ({
            update: mockUpdate,
          }),
        };

        // Test instance
        const testInstance = new NewBill({
          document: mockDocument,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: {},
        });

        const eventMock = {
          preventDefault: jest.fn(),
          target: {
            querySelector: (selector) => {
              switch (selector) {
                case 'input[data-testid="datepicker"]':
                  return { value: 'date' };
                case 'select[data-testid="expense-type"]':
                  return { value: 'type' };
                case 'input[data-testid="expense-name"]':
                  return { value: 'name' };
                case 'input[data-testid="amount"]':
                  return { value: '100' };
                case 'input[data-testid="vat"]':
                  return { value: 'vat' };
                case 'input[data-testid="pct"]':
                  return { value: '20' };
                case 'textarea[data-testid="commentary"]':
                  return { value: 'comment' };
                case 'input[data-testid="email"]':
                  return { value: "user@email.com" };
                default:
                  return null;
              }
            },
          },
        };

        // Submit formulaire
        testInstance.handleSubmit(eventMock);

        // Expect
        const dataToCheck = {
          email: 'user@email.com',
          type: 'type',
          name: 'name',
          amount: 100,
          date: 'date',
          vat: 'vat',
          pct: 20,
          commentary: 'comment',
          fileUrl: null,
          fileName: null,
          status: 'pending',
        };

        // Analyss data
        const data = JSON.parse(mockUpdate.mock.calls[0][0].data);
        console.log('data', data);

        expect(data).toMatchObject(dataToCheck);
      });
    });
  });
});
