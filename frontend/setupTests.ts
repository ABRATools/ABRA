import '@testing-library/jest-dom';

Object.defineProperty(window, 'location', {
  value: {
    host: 'localhost:3000',
    pathname: '/',
    protocol: 'http:',
    href: 'http://localhost:3000/',
    hostname: 'localhost',
    search: '',
    hash: '',
  },
  writable: true,
});

(window as any).fs = {
  readFile: jest.fn().mockImplementation((path, options) => {
    if (options && options.encoding === 'utf8') {
      return Promise.resolve('mock file content');
    }
    return Promise.resolve(new Uint8Array([0, 1, 2, 3]));
  })
};

jest.useFakeTimers();