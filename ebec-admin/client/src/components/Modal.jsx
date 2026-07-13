export default function Modal({ children, style, onClose }) {
  return (
    <div className="form-overlay fade-in" onClick={onClose}>
      {children}
    </div>
  );
}
