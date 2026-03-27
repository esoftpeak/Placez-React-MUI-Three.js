import { IconButton, Tooltip } from "@mui/material"
import { BWIcon } from "../../../../assets/icons"
import { useDispatch, useSelector } from "react-redux"
import { SetShaderView } from "../../../../reducers/blue"
import { ShaderView } from "../../models"
import { ReduxState } from "../../../../reducers"
import { ViewState } from "../../../../models/GlobalState"

const BlackWhiteShaderToggle = () => {
  const shaderView = useSelector((state: ReduxState) => state.blue.shaderView);
  const viewState = useSelector((state: ReduxState) => state.globalstate.viewState);
  const dispatch = useDispatch();

  return (
    <Tooltip title="Toggle Black and White Shader">
      <IconButton
        disabled={ viewState === ViewState.PhotosphereView || viewState === ViewState.StreetView }
        onClick={() => {
          if (shaderView === ShaderView.None) {
            dispatch(SetShaderView(ShaderView.BlackAndWhite));
          } else {
            dispatch(SetShaderView(ShaderView.None));
          }
        }}
      >
        <BWIcon
          color={`${shaderView === ShaderView.BlackAndWhite ? 'primary' : 'default'}`}
        />
      </IconButton>
    </Tooltip>
  )
}

export default BlackWhiteShaderToggle
