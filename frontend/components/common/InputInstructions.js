export default function InputInstructions({ instructions, header }) {
  return (
    <>
    <h2 className="text-[16px] mb-2 font-medium">{header}</h2>
      {instructions.map((instruction, index) => (
        <ul style={{listStyleType:"disc"}} key={index} className="flex flex-col items-start gap-4 text-white">
          <li className="block text-[14px]">- {instruction}</li>
        </ul>
      ))}
    </>
  );
}
