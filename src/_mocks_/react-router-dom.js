// src/__mocks__/react-router-dom.js
const React = require('react');

module.exports = {
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  }),
  useNavigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  MemoryRouter: ({ children, initialEntries }) => {
    return (
      <div data-testid="memory-router">
        {children}
      </div>
    );
  },
  BrowserRouter: ({ children }) => {
    return (
      <div data-testid="browser-router">
        {children}
      </div>
    );
  },
};
