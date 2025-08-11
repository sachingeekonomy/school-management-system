import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  textarea?: boolean;
  min?: string;
  max?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  textarea,
  min,
  max,
  inputProps,
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2 w-full"}>
      <label className="text-xs text-gray-500">{label}</label>
      {textarea ? (
        <textarea
          {...register(name)}
          className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full min-h-[100px] resize-vertical"
          {...inputProps}
          defaultValue={defaultValue}
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full"
          {...inputProps}
          defaultValue={defaultValue}
          min={min}
          max={max}
        />
      )}
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
