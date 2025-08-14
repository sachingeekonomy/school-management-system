"use client";

import { useState, memo } from "react";
import Image from "next/image";
import FormModal from "./FormModal";
import PaymentForm from "./forms/PaymentForm";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "message"
    | "payment"
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = memo(({ table, type, data, id }: FormContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // For payment forms, render directly without modal
  if (table === "payment") {
    return (
      <div className="inline-block">
        <button
          onClick={handleClick}
          className={`w-7 h-7 flex items-center justify-center rounded-full ${
            type === "create"
              ? "bg-green-500 hover:bg-green-600"
              : type === "update"
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          <Image
            src={
              type === "create"
                ? "/create.png"
                : type === "update"
                ? "/update.png"
                : "/delete.png"
            }
            alt=""
            width={16}
            height={16}
          />
        </button>
        {isOpen && (
          <PaymentForm type={type} data={data} onClose={handleClose} />
        )}
      </div>
    );
  }

  // For all other forms, use the existing FormModal
  return (
    <FormModal
      table={table}
      type={type}
      data={data}
      id={id}
    />
  );
});

FormContainer.displayName = 'FormContainer';

export default FormContainer;
