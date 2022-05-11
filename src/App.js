import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LayoutLanding from "./components/LayoutLanding";
import TabAll from "./pages/TabAll";
import NumpadPage from "./pages/NumpadPage";
import PrivateRoute from "./components/PrivateRoute";
import TabContact from "./pages/TabContact";
import AddContactPage from "./pages/AddContactPage";
import EditContactPage from "./pages/EditContactPage";
import EditProfilePage from "./pages/EditProfilePage";
import { useContainerLayout } from "./context/VideoContext";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { useRecentCallList } from "./context/RecentCallListContext";
import AuthContext from "./context/AuthenContext";
import { withOneTabEnforcer } from "react-one-tab-enforcer";
import { Row, Col, Button } from "antd";

function App() {
  const { videoLayout } = useContainerLayout();
  const [openDb, setOpenDb] = useState(null);
  const { recentCallList, setRecentCallList, fetch, setFetch } =
    useRecentCallList();
  const { user } = useContext(AuthContext);
  var indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;
  indexedDB.features = { getAllDirectionParam: true };
  // Open (or create) the database
  useEffect(() => {
    if (!openDb || user || fetch) {
      const open = indexedDB.open(`MyDatabase${user?.username}`, 2);
      setOpenDb(open);
      setFetch(false);
    }
    return () => {
      setOpenDb(null);
    };
  }, [fetch, indexedDB, setFetch, user]);

  // Create the schema
  if (openDb) {
    openDb.onupgradeneeded = async () => {
      const db = await openDb.result;
      const store = await db.createObjectStore("RecentLists", {
        keyPath: "id",
      });
      const index = await store.createIndex("NameIndex", [
        "name.displayName",
        "name.date",
        "name.status",
      ]);
    };

    openDb.onsuccess = async () => {
      // Start a new transaction
      const db = await openDb.result;
      setRecentCallList(openDb.result);
      const tx = db.transaction("RecentLists", "readwrite");
      const store = tx.objectStore("RecentLists");
      const index = store.index("NameIndex");
      // store.put({ id: 7001, name: { displayName: "padgad", date: Date.now(), status: "call" }, target: 7001 });

      // Add some data
      // store.put({ id: 67890, name: { first: "Bob", last: "Smith" }, age: 35 });

      // Query the data
      // const getJohn = store.getAll();
      // const getBob = index.get(["Smith", "Bob"]);

      // getJohn.onsuccess = function () {
      //   console.dir(store)
      //   console.log("getjonh", getJohn.result);  // => "John"
      // };

      // getBob.onsuccess = function () {
      //   console.log(getBob.result.name.first);   // => "Bob"
      // };

      // Close the db when the transaction is done
      // tx.oncomplete = function () {
      //   // db.close();
      //   window.location.reload()

      // };
    };
  }

  // console.log('5555555555555555', recentCallList)
  return (
    <Fragment>
      {/* {videoLayout} */}

      <div
        id="divshowvideo"
        style={{
          bottom: "0px",
          right: "0px",
          width: "100%",
          height: "100%",
          position: "fixed",
          zIndex: videoLayout ? 1 : -1,
          background: videoLayout ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0)",
        }}
      >
        {/* {isPictureInPictureAvailable && (
  <button
    onClick={() => togglePictureInPicture(!isPictureInPictureActive)}
  >
    {isPictureInPictureActive? 'Disable' : 'Enable'} Picture in Picture
  </button>)} */}
        <video
          id="remote_video_softphone"
          style={{
            bottom: "0px",
            right: "0px",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
          // src={simpleUser?.session?.sessionDescriptionHandler?.remoteMediaStream?.getVideoTracks()}
          autoPlay
        ></video>
        <video
          id="local_video_softphone"
          // src={simpleUser?.session?.sessionDescriptionHandler?.localMediaStream?.getVideoTracks()}
          style={{
            position: "absolute",
            bottom: "0px",
            right: "0px",
            width: "30%",
          }}
          autoPlay
        ></video>
      </div>
      <Router>
        <Switch>
          <Route exact path="/" component={LoginPage} />
          <LayoutLanding>
            <PrivateRoute exact path="/taball" component={TabAll} />
            <PrivateRoute exact path="/numpad" component={NumpadPage} />
            <PrivateRoute exact path="/tabcontact" component={TabContact} />
            <PrivateRoute
              exact
              path="/addcontactpage"
              component={AddContactPage}
            />
            <PrivateRoute
              exact
              path="/editcontactpage"
              component={EditContactPage}
            />
            <PrivateRoute
              exact
              path="/editprofilepage"
              component={EditProfilePage}
            />
          </LayoutLanding>
        </Switch>
      </Router>
    </Fragment>
  );
}
const DifferentWarningComponent = () => (
  <Row style={{ height: "100vh" }} justify="center" align="middle">
    <Col>
      <div>
        ไม่สามารถเปิดหน้าต่างใหม่ได้ เนื่องจากมีการเปิดหน้าต่างที่ดำเนินการอยู่ขณะนี้
      </div>
      <Row style={{ marginTop:'5px' }} justify="center" align="middle">
      <Button onClick={closeWin} type="text" danger>ปิดหน้าต่าง</Button></Row>
    </Col>
  </Row>
);
function closeWin() {
  window.close();
}
export default withOneTabEnforcer({
  appName: "softphone",
  OnlyOneTabComponent: DifferentWarningComponent,
  localStorageTimeout: 15 * 1000,
  localStorageResetInterval: 10 * 1000,
 
})(App);
