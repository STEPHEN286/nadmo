import Spinner from "@/components/ui/spinner";


export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
      <Spinner size={48} color="red" />
      <span style={{ fontSize: '1.2rem', color: '#888', marginTop: 16 }}>Loading users...</span>
    </div>
  );
} 