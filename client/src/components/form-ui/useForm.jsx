import React, { useState } from 'react';

/**
 * Given initial field values and a validator function, define properties that would be
 * beneficial for child components of the Form component, such as a handler for input change.
 * @param initialFValues - initial field values.
 * @param {boolean} validateOnChange - determines whether validation should occur on change of values.
 * @param validate - function that is responsible for error validation of fields.
 * @returns Properties that will be useful for child components of a Form component.
 */
function useForm(initialFValues, validateOnChange = false, validate) {
  const [values, setValues] = useState(initialFValues);
  const [errors, setErrors] = useState({});

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setValues({
      ...values,
      [name]: value,
    });

    if (validateOnChange) {
      validate({ [name]: value });
    }
  };

  return { values, errors, setErrors, handleInputChange };
}

export default useForm;