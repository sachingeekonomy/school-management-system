import { getUserRoleSync } from "@/lib/getUserRole";
import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import ProfileEditForm from "@/components/ProfileEditForm";

const ProfilePage = async () => {
  // Get user role and current user
  const role = await getUserRoleSync();
  const session = await getUserSession();
  const userId = session?.id;

  console.log("Profile page - User role determined:", role);
  console.log("Profile page - User ID:", userId);

  // Fetch user-specific data based on role
  let userData = null;
  
  console.log("About to fetch user data for role:", role, "and userId:", userId);
  
  if (role === "student" && userId) {
    userData = await prisma.student.findUnique({
      where: { id: userId },
      include: {
        class: {
          include: {
            grade: true
          }
        },
        parent: true
      }
    });
  } else if (role === "teacher" && userId) {
    userData = await prisma.teacher.findUnique({
      where: { id: userId },
      include: {
        subjects: true,
        classes: true
      }
    });
    console.log("Teacher data fetched by ID:", userData);
    
    // If not found by ID, try to find by email from session
    if (!userData && session?.username) {
      userData = await prisma.teacher.findUnique({
        where: { email: `${session.username}@example.com` },
        include: {
          subjects: true,
          classes: true
        }
      });
      console.log("Teacher data fetched by email:", userData);
    }
    
    // For debugging: if no teacher data found, create a sample object
    if (role === "teacher" && !userData) {
      console.log("No teacher data found, creating sample data for debugging");
      userData = {
        name: "Sample Teacher",
        surname: "One",
        email: "teacher1@example.com",
        phone: "123-456-7891",
        bloodType: "A+",
        birthday: new Date("1990-01-01"),
        subjects: [],
        classes: []
      };
    }
  } else if (role === "parent" && userId) {
    userData = await prisma.parent.findUnique({
      where: { id: userId },
      include: {
        students: {
          include: {
            class: {
              include: {
                grade: true
              }
            }
          }
        }
      }
    });
  }

  // Determine if user can edit profile (admin and teacher only)
  const canEdit = role === "admin" || role === "teacher";

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
          <div className="w-1/3">
            <Image
              src={(userData as any)?.img || "/noAvatar.png"}
              alt="Profile"
              width={144}
              height={144}
              className="w-36 h-36 rounded-full object-cover"
            />
          </div>
          <div className="w-2/3 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                {userData?.name || session?.name} {userData?.surname || session?.surname}
              </h1>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full capitalize">
                {role}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {userData?.email || `${session?.username}@example.com`}
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/blood.png" alt="" width={14} height={14} />
                <span>{(userData as any)?.bloodType || "N/A"}</span>
              </div>
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/date.png" alt="" width={14} height={14} />
                <span>
                  {(userData as any)?.birthday ? new Date((userData as any).birthday).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/mail.png" alt="" width={14} height={14} />
                <span>{userData?.email || `${session?.username}@example.com`}</span>
              </div>
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/phone.png" alt="" width={14} height={14} />
                <span>{(userData as any)?.phone || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Section - Only for admin and teacher */}
        {canEdit && (
          <div className="mt-4 bg-white p-4 rounded-md">
            <ProfileEditForm userData={userData} role={role} />
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Account Information</h1>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Username:</span>
              <span className="font-medium">{(userData as any)?.username || session?.username || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">User ID:</span>
              <span className="font-medium text-xs">{userId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Role:</span>
              <span className="font-medium capitalize">{role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Member Since:</span>
              <span className="font-medium">
                {(userData as any)?.createdAt ? new Date((userData as any).createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Role-specific information */}
        {role === "student" && userData && (
          <div className="bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold">Academic Information</h1>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Class:</span>
                <span className="font-medium">{(userData as any).class?.name || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Grade:</span>
                <span className="font-medium">{(userData as any).class?.grade?.level || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Parent:</span>
                <span className="font-medium">
                  {(userData as any).parent?.name} {(userData as any).parent?.surname}
                </span>
              </div>
            </div>
          </div>
        )}

        {role === "teacher" && userData && (
          <div className="bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold">Teaching Information</h1>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <span className="text-sm text-gray-500">Subjects:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(userData as any).subjects?.map((subject: any) => (
                    <span key={subject.id} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                      {subject.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Classes:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(userData as any).classes?.map((class_: any) => (
                    <span key={class_.id} className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                      {class_.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {role === "parent" && userData && (
          <div className="bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold">Children</h1>
            <div className="mt-4 flex flex-col gap-4">
              {(userData as any).students?.map((student: any) => (
                <div key={student.id} className="border p-3 rounded">
                  <div className="font-medium">{student.name} {student.surname}</div>
                  <div className="text-sm text-gray-500">
                    Class: {student.class?.name} | Grade: {student.class?.grade?.level}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
