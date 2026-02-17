"use client";

import React, {useEffect, useRef, useState} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authService } from "@/lib/services/authService";
import { PasswordInput } from "@/components/passwordInput-component/PasswordInputComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import DatePickerComponent from "@/components/date-picker-component/DatePickerComponent";
import styles from "./RegisterComponent.module.css";
import IMask from "imask";
import ButtonsSocialComponent from "@/components/buttons-social-component/ButtonsSocialComponent";
import {useSession} from "next-auth/react";
import {AxiosError} from "axios";


const RegisterComponent = () => {
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phone, setPhone] = useState("");
    const [isRulesAccepted, setIsRulesAccepted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [errorFields, setErrorFields] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();


  const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.needsProfile) {
            router.push("/auth/complete-profile");
        } else if (session) {
            router.push("/");
        }
    }, [session, router]);



  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;
  const validateBirthDate = (date: Date | null): date is Date => {
  if (!date) return false;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age >= 18 && age < 150;
};

    const isValidPhone = (phone: string) => {
  const re = /^\+\d{2} \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
  return re.test(phone);
};


    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        console.log('Form submitted with values:', {
            email,
            name,
            surname,
            phone,
            birthDate,
            password,
            confirmPassword,
            isRulesAccepted
        });

        event.preventDefault();
        setErrorMsg("");
        setErrorFields({});
        const errors: { [key: string]: string } = {};

        if (!validateEmail(email)) {
            errors.email = "Please enter a valid email address.";
        }

        if (password !== confirmPassword) {
            errors.password = "Passwords do not match.";
        } else if (!validatePassword(password)) {
            errors.password = "Password must be at least 6 characters long.";
        }

        if (!isValidPhone(phone)) {
            errors.phone = "Phone number must be in format +xx (xxx) xx-xx-xx";
        }

        if (!validateBirthDate(birthDate)) {
            errors.birthDate = "You must be at least 18 years old.";
        }

        if (!isRulesAccepted) {
            errors.rules = "You must accept the rules";
        }

        if (Object.keys(errors).length > 0) {
            setErrorFields(errors);
            console.log("Errors:", errors);
            return;
        }

        setIsSubmitting(true);

        try {
            if (!birthDate) {
                errors.birthDate = "Birth date is required";
                setErrorFields(errors);
                return;
            }

            await authService.register({
                email,
                password,
                profile: {
                    name,
                    surname,
                    phone,
                    birth_date: birthDate.toISOString().split("T")[0],
                    is_rules_accepted: isRulesAccepted,
                },
            });
            router.push("/?message=Please check your email to activate your account");
        } catch (err: unknown) {
        if (err instanceof AxiosError) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 400) {
                setErrorMsg("A user with this email already exists. Try logging in.");
            } else if (status === 401 || status === 403) {
                setErrorMsg("You are not authorized to perform this action.");
            }  else if (status !== undefined && status >= 500) {
                setErrorMsg("Server error occurred. Please try again later.");
            } else {
                setErrorMsg("An unknown error occurred. Please try again.");
            }
            console.error("Register failed:", status, data);
        } else if (err instanceof Error) {

            setErrorMsg(err.message || "An unexpected error occurred.");
        } else {
            setErrorMsg("An unexpected error occurred.");
        }
    } finally {
        setIsSubmitting(false);
    }
};

    useEffect(() => {
    if (inputRef.current) {
      const maskOptions = {
        mask: '+{00} (000) 000-00-00',
      };
      const mask = IMask(inputRef.current, maskOptions);

      return () => {
        mask.destroy();
      };
    }
  }, []);

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  return (
    <div className={styles.centerContainer}>
      <form onSubmit={handleSubmit} className={`auth ${styles.form}`}>
        <h2 className={styles.title}>Sign Up</h2>

        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email"
            required
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className={styles.icon}>
            <Image src="/images/user3.png" alt="user icon" width={24} height={24} className={styles.img}/>
          </div>
          {errorFields.email && <p className={styles.error}>{errorFields.email}</p>}
        </div>

        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Name"
            required
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Surname"
            required
            className={styles.input}
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>

          <div className={styles.inputGroup}>
              <input className={styles.input}
                     ref={inputRef}
                     value={phone}
                     onChange={handleChange}
                     type="tel"
                     placeholder="+xx (xxx) xxx-xx-xx"
              />
          </div>

          <div className={styles.inputGroup}>
              <div className={styles.calendarWrapper}>
                  <input
                      type="text"
                      placeholder="Birth Date"
                      className={styles.input}
                      value={birthDate ? birthDate.toLocaleDateString() : ""}
                      onChange={(e) => {
                          const value = e.target.value;
                          if (!value) {
                              setBirthDate(null);
                              setIsCalendarOpen(false);
                          } else {
                              setIsCalendarOpen(true);
                          }
                      }}
                      onKeyDown={(e) => {
                          if (e.key === "Backspace" || e.key === "Delete") {
                              setBirthDate(null);
                              setIsCalendarOpen(false);
                          }
                      }}
                      readOnly={false}
                  />
                  <div onClick={() => setIsCalendarOpen(!isCalendarOpen)} className={styles.icon}>
                      <Image src="/images/calendar.png" alt="calendar icon" width={20} height={20}
                             className={styles.img}/>
                  </div>

                  {isCalendarOpen && (
                      <div className={styles.calendarSidebar}>
                          <DatePickerComponent
                          dateValue={birthDate}
                          setDateValue={(date) => {
                              setBirthDate(date);
                              setIsCalendarOpen(false);
                          }}
                          yearRange={[1926, new Date().getFullYear()]}
                          />
                      </div>
                  )}
              </div>
          </div>



          <PasswordInput value={password} onChangeAction={setPassword} placeholder="Password (min 6 characters)"/>
          <PasswordInput value={confirmPassword} onChangeAction={setConfirmPassword} placeholder="Confirm Password"/>

          <div className={styles.inputError}>
              {errorFields.password && <p className={styles.error}>{errorFields.password}</p>}
              {errorFields.birthDate && <p className={styles.error}>{errorFields.birthDate}</p>}
              {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          </div>

          <div className={styles.checkboxGroup}>
              <label className="checkbox">
                  <input
                      type="checkbox"
                      checked={isRulesAccepted}
                      onChange={(e) => setIsRulesAccepted(e.target.checked)}
                      required
                      className={styles.checkboxInput}
                  />
                    <span className={styles.checkboxSpan}></span>
                  I confirm that I am over 18 and accept the rules
              </label>
          </div>

          <button type="submit" className={styles.button} disabled={isSubmitting}>
              {isSubmitting ?
                  <div className={`authButton ${styles.loaderWrapper}`}><LoaderComponent/></div> : "Sign Up"}
          </button>

        <div className={styles.bottomContainer}>
          <p className={styles.registerText}>
            Already have an account? <a href="/login" className={styles.link}>Sign in</a>
          </p>
            <ButtonsSocialComponent/>
        </div>
      </form>
    </div>
  );
};

export default RegisterComponent;



