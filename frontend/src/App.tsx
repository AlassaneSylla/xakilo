import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { Providers } from './providers';
import router from './router';

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </Providers>
  );
}