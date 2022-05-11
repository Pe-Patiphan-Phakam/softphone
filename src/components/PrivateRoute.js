import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";

// import { useSimpleUser } from "../context/SimpleUserContext";
import AuthContext from "../context/AuthenContext";
const PrivateRoute = ({ component: Component, ...rest }) => {
  // const { simpleUser } = useSimpleUser()
  // // console.log('in Private', user, project)
  // if (!simpleUser) {
  //     // removeToken()
  //     return (<Redirect to="/" />)
  // }

  // if (!simpleUser) {
  // removeToken()
  // return (<Redirect to="/" />)
  // }
  const { checkToken, removeToken } = useContext(AuthContext);
  // const { project } = useContext(ProjectContext)
  const { user } = checkToken();
  // console.log('in Private', user, project)
  if (!user) {
    // removeToken()
    // removeToken()
    return <Redirect to="/" />;
  }
  // if (user?.code && (project?.code !== projectCode)) {
  //   // removeToken()
  //   return (<Redirect to={`/${project.code}/alarmboard`} />)
  // }
  // if (!project) {
  //   // removeToken()
  //   return (<Redirect to="/" />)
  // }
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};
PrivateRoute.propTypes = {
  component: PropTypes.func,
};
PrivateRoute.defaultProps = {
  component: null,
};

export default PrivateRoute;
