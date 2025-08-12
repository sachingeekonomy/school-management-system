import { getUserSession } from "@/lib/auth";

const TestAuthPage = async () => {
  const session = await getUserSession();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      {session ? (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold text-green-800">✅ Authenticated</h2>
          <p><strong>User ID:</strong> {session.id}</p>
          <p><strong>Username:</strong> {session.username}</p>
          <p><strong>Role:</strong> {session.role}</p>
          <p><strong>Name:</strong> {session.name} {session.surname}</p>
        </div>
      ) : (
        <div className="bg-red-100 p-4 rounded">
          <h2 className="font-semibold text-red-800">❌ Not Authenticated</h2>
          <p>No session found. Please log in.</p>
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="font-semibold">Test Links:</h3>
        <ul className="list-disc list-inside mt-2">
          <li><a href="/admin" className="text-blue-600 hover:underline">Admin Dashboard</a></li>
          <li><a href="/teacher" className="text-blue-600 hover:underline">Teacher Dashboard</a></li>
          <li><a href="/list/teachers" className="text-blue-600 hover:underline">Teachers List</a></li>
          <li><a href="/list/students" className="text-blue-600 hover:underline">Students List</a></li>
        </ul>
      </div>
    </div>
  );
};

export default TestAuthPage;
