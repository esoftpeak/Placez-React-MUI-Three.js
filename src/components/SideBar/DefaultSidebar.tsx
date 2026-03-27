import { mainRoutes } from '../../routes';
import SideBarButton from './SideBarButton';
import { createElement } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { SetGlobalFilter } from '../../reducers/settings';
import { useDispatch } from 'react-redux';

interface Props {}

const DefaultSidebar = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <>
      {mainRoutes.map((route) => {
        const isSelected = route.path === '/'
          ? location.pathname === route.path
          : location.pathname.includes(route.path);

        return (
          <SideBarButton
            key={route.path}
            label={route.name}
            selected={isSelected}
            disabled={route.disabled}
            onClick={() => {
              navigate(route.path);
              dispatch(SetGlobalFilter(''))
            }}
          >
            {createElement(route.icon)}
          </SideBarButton>
        );
      })}
    </>
  );
};

export default DefaultSidebar;
