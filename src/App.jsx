import Navbar from './components/Navbar';
import DocumentHeader from './components/DocumentHeader';
import RichTextEditor from './components/RichTextEditor';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <DocumentHeader title="Untitled Document" />
        <RichTextEditor />
      </main>
    </div>
  );
}

export default App;
