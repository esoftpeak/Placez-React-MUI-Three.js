import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router"
import { ReduxState } from "../../reducers"
import { useEffect } from "react"

const PlacezNavigate = () => {
  const navigate = useNavigate();
  const navigationTarget = useSelector( (state: ReduxState) => state.ui.target);
  const dispatch = useDispatch();

  useEffect(() => {
    if (navigationTarget) {
      navigate(navigationTarget);
      dispatch({ type: 'NAVIGATE', target: null });
    }
  }, [navigationTarget, navigate]);

  return null; // No need to render anything

};

export default PlacezNavigate;
