import { Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Theme } from "@mui/material"
import { LocalStorageKey, useLocalStorageState } from "../Hooks/useLocalStorageState"
import { useState } from "react"
import { makeStyles } from "@mui/styles"
import formModalStyles from "../Styles/FormModal.css"
import PlacezActionButton from "../PlacezUIComponents/PlacezActionButton"

const GPUDiagnostics = () => {
  function getWebGLInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext || canvas.getContext('webgl2') as WebGL2RenderingContext;
    if (!gl) {
        console.error('WebGL not supported');
        // store.dispatch(
        //   ToastMessage(
        //     'WebGL is not supported on this device',
        //      null
        //   )
        // );
        return null;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {
        console.error('WEBGL_debug_renderer_info not supported');
        return null;
    }

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);

    return {
        renderer: renderer,
        vendor: vendor
    };
  }

  function isDedicatedGPU(renderer) {
      // Common dedicated GPU identifiers (simplified example)
      const dedicatedGPUs = [
          'NVIDIA', 'GeForce', 'Quadro',
          'AMD', 'Radeon', 'RX', 'Ryzen',
          'Intel Iris'
      ];

      return dedicatedGPUs.some(name => renderer.includes(name));
  }

  const webGLInfo = getWebGLInfo();

  let usingDedicatedGPU = false;

  if (webGLInfo) {
      console.log('Renderer:', webGLInfo.renderer);
      console.log('Vendor:', webGLInfo.vendor);
      usingDedicatedGPU = isDedicatedGPU(webGLInfo.renderer);
      console.log('Using dedicated GPU:', usingDedicatedGPU);
      if (!usingDedicatedGPU) {
        // store.dispatch(
        //   ToastMessage(
        //     'Your Device is not using a dedicated GPU, performance may be affected. Contact Placez Support for more information.',
        //   )
        // );
      }
  } else {
    // store.dispatch(
    //   ToastMessage(
    //     'No WebGL Info Found',
    //   )
    // );
  }

  const [gpuNotification, setGPUNotification] = useLocalStorageState(LocalStorageKey.GPUNotification);
  const [open, setOpen] = useState(true);
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles();

  return (
    <Dialog open={!usingDedicatedGPU && gpuNotification && open}>
      <DialogTitle className={classes.dialogTitle}>Top Tip</DialogTitle>
      <DialogContent style={{padding: '20px'}}>
        Your device is not using a dedicated GPU. This may affect performance. Contact Placez Support at help@getplacez.com for more information.
        <div style={{display: 'flex', justifyContent: 'end', alignItems: 'center'}}>
          Do not show again <Checkbox checked={!gpuNotification} onChange={(e, v) => setGPUNotification(!v)}/>
        </div>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <PlacezActionButton onClick={() => setOpen(false)}>Close</PlacezActionButton>
      </DialogActions>

    </Dialog>


  )
}

export default GPUDiagnostics
