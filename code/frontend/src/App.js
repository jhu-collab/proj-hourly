import { CssVarsProvider } from '@mui/joy/styles';
import Button from '@mui/joy/Button';

function App() {
  return (
    <CssVarsProvider>
      <Button>Joy UI</Button>
    </CssVarsProvider>
  );
}

export default App;
