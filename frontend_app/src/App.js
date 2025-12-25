import "./styles/style.css";

import {Routes, Route} from "react-router-dom";
import {RouteGuard} from "./components/Basic/RouteGuard/RouteGuard";

import {GameProvider} from "./context/GameContext";
import {AuthProvider} from "./context/AuthContext";
import {BoughtGamesProvider} from "./context/BoughtGamesContext";

import {Header} from "./components/Basic/Header/Header";
import {Footer} from "./components/Basic/Footer/Footer";

import {Home} from "./components/Home/Home";
import {Register} from "./components/Register/Register";
import {Login} from "./components/Login/Login";
import {Logout} from "./components/Logout/Logout";

import {UserDetails} from "./components/UserDetails/UserDetails";
import {UserDetailsEdit} from "./components/UserDetails/UserDetailsEdit";

import {EditGame} from "./components/EditGame/EditGame";
import {CreateGame} from "./components/CreateGame/CreateGame";
import {MyGames} from "./components/Catalog/MyGames";
import {DetailsGame} from "./components/DetailsGame/DetailsGame";
import {BoughtGames} from "./components/BoughtGames/BoughtGames";
import {CatalogLayout} from "./components/Shared/CatalogLayout";

function App() {
    return (
        <AuthProvider>
            <BoughtGamesProvider>
                <GameProvider>
                    <div>
                        <Header/>

                        <Routes>
                            <Route path="/" element={
                                <CatalogLayout>
                                    <Home/>
                                </CatalogLayout>
                            }/>
                            <Route path="/my-games" element={
                                <CatalogLayout>
                                    <MyGames/>
                                </CatalogLayout>
                            }/>
                            <Route path="/register" element={<Register/>}/>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/logout" element={<Logout/>}/>

                            <Route
                                path="/catalog/:gameId"
                                element={
                                    <RouteGuard>
                                        <DetailsGame/>
                                    </RouteGuard>
                                }
                            />

                            <Route
                                path="/catalog/:gameId/edit"
                                element={
                                    <RouteGuard>
                                        <EditGame/>
                                    </RouteGuard>
                                }
                            />

                            <Route
                                path="/create"
                                element={
                                    <RouteGuard>
                                        <CreateGame/>
                                    </RouteGuard>
                                }
                            />

                            <Route
                                path="/bought-games"
                                element={
                                    <RouteGuard>
                                        <CatalogLayout>
                                            <BoughtGames/>
                                        </CatalogLayout>
                                    </RouteGuard>
                                }
                            />


                            <Route
                                path="/user-details/edit/:userId"
                                element={
                                    <RouteGuard>
                                        <UserDetailsEdit/>
                                    </RouteGuard>
                                }
                            />

                            <Route
                                path="/user-details"
                                element={
                                    <RouteGuard>
                                        <UserDetails/>
                                    </RouteGuard>
                                }
                            />
                        </Routes>

                        <Footer/>
                    </div>
                </GameProvider>
            </BoughtGamesProvider>
        </AuthProvider>
    );
}

export default App;
