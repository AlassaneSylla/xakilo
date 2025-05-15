
interface CardProps {
    title: string,
    totalProduct: number,
    color: string
}
export default function Card({title, totalProduct, color}: CardProps) {
    return (
        <div className="card w-50 bg-[var(--black)] shadow-md">
            <div className="card-body min-h-[150px] flex flex-col justify-between">
              <div className="flex justify-between">
                <h2 className="text-xl font-bold text-[var(--brokenWhite)]">{title}</h2>
                {/* <span className="text-xl">$29/mo</span> */}
              </div>
              <ul className="mt-6 flex flex-col gap-2 text-xs">
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4 me-2 inline-block text-[var(--brokenWhite)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  <span className={`badge badge-xl font-semibold text-[var(--brokenWhite)] ${color}`}>{totalProduct}</span>
                  {/* <span>High-resolution image generation</span> */}
                </li>
              </ul>
            </div>
        </div>
    )
}