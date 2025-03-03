import React, { forwardRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown, Phone } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

const Input46 = forwardRef(
  ({ id, phoneValue, placeholder, onChange, ...props }: any, ref) => {
    return (
      <div className="space-y-2" dir="ltr">
        <Label htmlFor={id}>Phone number</Label>
        <RPNInput.default
          className="flex rounded-lg shadow-sm shadow-black/5"
          international
          placeholder={placeholder}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={PhoneInput}
          id={id}
          value={phoneValue}
          onChange={onChange}
          {...props}
        />
      </div>
    );
  }
);

const PhoneInput = forwardRef(
  ({ className, ...props }: React.ComponentProps<"input">, ref) => (
    <Input
      className={cn(
        "-ms-px rounded-s-none shadow-none focus-visible:z-10",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: { label: string; value: RPNInput.Country | undefined }[];
};

PhoneInput.displayName = "PhoneInput";

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange((event.target.value as RPNInput.Country) || undefined);
  };

  return (
    <div className="relative inline-flex items-center self-stretch rounded-s-lg border border-input bg-background py-2 pe-2 ps-3 text-muted-foreground ring-offset-background transition-shadow focus-within:z-10 focus-within:border-ring focus-within:text-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring/30 focus-within:ring-offset-2 hover:bg-accent hover:text-foreground has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50">
      <div className="inline-flex items-center gap-1" aria-hidden="true">
        <FlagComponent country={value} countryName={value} aria-hidden="true" />
        <span className="text-muted-foreground/80">
          <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
      <select
        disabled={disabled}
        value={value || ""}
        onChange={handleSelect}
        className="absolute inset-0 text-sm opacity-0"
        aria-label="Select country"
      >
        <option
          key="default"
          value=""
          className="dark:text-gray-400 dark:bg-[#09090B]"
        >
          Select a country
        </option>
        {options
          .filter((x) => x.value)
          .map((option, i) => (
            <option
              key={option.value ?? `empty-${i}`}
              value={option.value}
              className="dark:text-gray-400 dark:bg-[#09090B]"
            >
              {option.label}{" "}
              {option.value &&
                `+${RPNInput.getCountryCallingCode(option.value)}`}
            </option>
          ))}
      </select>
    </div>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="w-5 overflow-hidden rounded-sm">
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <Phone size={16} aria-hidden="true" />
      )}
    </span>
  );
};

Input46.displayName = "Input46";
export default Input46;
