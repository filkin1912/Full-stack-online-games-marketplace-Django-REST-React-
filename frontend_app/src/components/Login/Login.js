import {useContext} from "react";
import {AuthContext} from "../../context/AuthContext";
import {useForm} from "../../hooks/useForm";
import {Link} from "react-router-dom";

const LoginFormKeys = {
    Email: "email",
    Password: "password",
};

export const Login = () => {
    const {onLoginSubmit} = useContext(AuthContext);

    const {values, errors, changeHandler, onSubmit} = useForm(
        {
            [LoginFormKeys.Email]: "",
            [LoginFormKeys.Password]: "",
        },
        onLoginSubmit
    );

    return (
        <div id="box">
            <p className="no-articles">LOGIN</p>

            <section className="form-page content auth">
                <form id="login" method="POST" onSubmit={onSubmit}>
                    <div className="container">
                        <div className="brand-logo"></div>

                        {/* ✅ General login error */}
                        {errors.general && (
                            <p style={{color: "red", marginBottom: "10px"}}>
                                {errors.general}
                            </p>
                        )}

                        {/* ✅ Email */}
                        <div className="form-group">
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                className="form-control"
                                name={LoginFormKeys.Email}
                                value={values[LoginFormKeys.Email]}
                                onChange={changeHandler}
                            />
                            {errors.email && (
                                <p style={{color: "red"}}>{errors.email}</p>
                            )}
                        </div>

                        {/* ✅ Password */}
                        <div className="form-group">
                            <input
                                type="password"
                                id="login-password"
                                placeholder="Password"
                                className="form-control"
                                name={LoginFormKeys.Password}
                                value={values[LoginFormKeys.Password]}
                                onChange={changeHandler}
                            />
                            {errors.password && (
                                <p style={{color: "red"}}>{errors.password}</p>
                            )}
                        </div>

                        <button type="submit" className="btn btn--submit">
                            Login Profile
                        </button>

                        <p style={{marginTop: "15px"}}>
                            Don't have an account?{" "}
                            <Link to="/register">Register</Link>
                        </p>
                    </div>
                </form>
            </section>
        </div>
    );
};
