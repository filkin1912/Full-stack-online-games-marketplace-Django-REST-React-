import { useContext } from "react";
import { useForm } from "../../hooks/useForm";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export const Register = () => {
    const { onRegisterSubmit } = useContext(AuthContext);

    const { values, errors, changeHandler, onSubmit } = useForm(
        {
            email: "",
            password: "",
            confirmPassword: "",
        },
        onRegisterSubmit
    );

    return (
        <div id="box">
            <p className="no-articles">CREATE PROFILE</p>

            <section className="form-page auth">
                <form id="register" method="POST" onSubmit={onSubmit}>
                    <div className="container">
                        <div className="brand-logo1"></div>

                        {/* ✅ General backend/server error */}
                        {errors.general && (
                            <p style={{ color: "red", marginBottom: "10px" }}>
                                {errors.general}
                            </p>
                        )}

                        {/* ✅ Email */}
                        <div className="form-group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Email"
                                className="form-control"
                                value={values.email}
                                onChange={changeHandler}
                            />
                            {errors.email && (
                                <p style={{ color: "red" }}>{errors.email}</p>
                            )}
                        </div>

                        {/* ✅ Password */}
                        <div className="form-group">
                            <input
                                type="password"
                                id="register-password"
                                name="password"
                                placeholder="Password"
                                className="form-control"
                                value={values.password}
                                onChange={changeHandler}
                            />
                            {errors.password && (
                                <p style={{ color: "red" }}>{errors.password}</p>
                            )}
                        </div>

                        {/* ✅ Confirm Password */}
                        <div className="form-group">
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirmPassword"
                                placeholder="Repeat password"
                                className="form-control"
                                value={values.confirmPassword}
                                onChange={changeHandler}
                            />
                            {errors.confirmPassword && (
                                <p style={{ color: "red" }}>
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <button type="submit" className="btn btn--submit">
                            Create Profile
                        </button>

                        <p style={{ marginTop: "15px" }}>
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </div>
                </form>
            </section>
        </div>
    );
};
