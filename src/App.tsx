import { DataProvider } from "./context/DataContext";
import Layout from './components/Layout'
import './App.css'

function App() {
  return (
    <>
      <DataProvider>
        <Layout>
          {null}
        </Layout>
      </DataProvider>
    </>
  )
}

export default App
