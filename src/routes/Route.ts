export interface Route {
  path: string;
  name: string;
  component: any;
  disabled?: boolean;
}

export interface MainRoute extends Route {
  icon: (props) => JSX.Element;
}

type NamedMainRoute = {
  main: MainRoute;
};

export type NamedRoutes = {
  [name: string]: Route | MainRoute;
};

export interface IndexedPathParams {
  id: number;
}

export type RouteSection = NamedRoutes & NamedMainRoute;
