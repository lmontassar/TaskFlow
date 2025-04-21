import { ChaoticOrbit } from 'ldrs/react'
import 'ldrs/react/ChaoticOrbit.css'
import { useTranslation } from 'react-i18next';

export default function Loading() {
    const {t} = useTranslation();
    return (
        <div className="min-h-60 flex flex-col bg-white rounded-xl ">
            <div className="flex flex-auto flex-col justify-center items-center p-4 md:p-5">
                <div className="flex justify-center">
                    <div className="flex flex-col items-center justify-center gap-3 h-full">
                        <ChaoticOrbit size="50" speed="1.5" color="#6049e7" />
                        <h2> {t("loading","Loading...")}  </h2>
                    </div>
                </div>
            </div>
        </div>


    );
}
