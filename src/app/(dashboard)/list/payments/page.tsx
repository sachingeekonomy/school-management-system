import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterSortButtons from "@/components/FilterSortButtons";
import SearchResultsIndicator from "@/components/SearchResultsIndicator";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getUserSession } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type PaymentList = {
  id: string;
  studentId: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  dueDate: Date;
  description?: string;
  status: string;
  createdAt: Date;
  student: {
    name: string;
    surname: string;
    email?: string;
    img?: string;
  };
};

const PaymentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getUserSession();
  const role = session?.role;
  const userId = session?.id;
  
  // Debug logging
  console.log("Session:", session);
  console.log("User ID:", userId);
  console.log("Role from session:", role);
  
  // Fallback: if role is undefined, try to get from user data
  let finalRole = role;
  if (!finalRole && userId) {
    try {
      const user = await prisma.teacher.findUnique({
        where: { id: userId },
        select: { id: true }
      });
      if (user) {
        finalRole = 'teacher';
      } else {
        finalRole = 'admin';
      }
    } catch (error) {
      console.log("Error checking user role:", error);
      finalRole = 'admin';
    }
  }

  const columns = [
    {
      header: "Student Info",
      accessor: "studentInfo",
    },
    {
      header: "Amount",
      accessor: "amount",
    },
    {
      header: "Payment Type",
      accessor: "paymentType",
      className: "hidden md:table-cell",
    },
    {
      header: "Payment Method",
      accessor: "paymentMethod",
      className: "hidden lg:table-cell",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
    },
    {
      header: "Created At",
      accessor: "createdAt",
      className: "hidden lg:table-cell",
    },
    ...(finalRole === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "TUITION":
        return "bg-blue-100 text-blue-800";
      case "EXAM":
        return "bg-purple-100 text-purple-800";
      case "TRANSPORT":
        return "bg-orange-100 text-orange-800";
      case "LIBRARY":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderRow = (item: PaymentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.student.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.student.name} {item.student.surname}</h3>
          <p className="text-xs text-gray-500">{item.student.email}</p>
        </div>
      </td>
      <td className="font-semibold text-green-600">
        {item.amount.toFixed(2)}
      </td>
      <td className="hidden md:table-cell">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(item.paymentType)}`}>
          {item.paymentType}
        </span>
      </td>
      <td className="hidden lg:table-cell">
        <span className="text-sm">{item.paymentMethod.replace('_', ' ')}</span>
      </td>
      <td className="hidden md:table-cell">
        <span className="text-sm">{new Date(item.dueDate).toLocaleDateString()}</span>
      </td>
      <td>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      </td>
      <td className="hidden lg:table-cell">
        <span className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/payments/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {finalRole === "admin" && (
            <>
              <FormContainer key={`payment-update-${item.id}`} table="payment" type="update" data={item} />
              <FormContainer key={`payment-delete-${item.id}`} table="payment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Build query manually since Prisma types might not be available
  const whereClause: any = {};

  // Handle additional filters
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "status":
            whereClause.status = value;
            break;
          case "paymentType":
            whereClause.paymentType = value;
            break;
          case "paymentMethod":
            whereClause.paymentMethod = value;
            break;
          case "search":
            whereClause.OR = [
              { studentId: { contains: value, mode: "insensitive" } },
              { description: { contains: value, mode: "insensitive" } },
              { student: { name: { contains: value, mode: "insensitive" } } },
              { student: { surname: { contains: value, mode: "insensitive" } } },
              { student: { email: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Sort configuration
  const sortBy = queryParams.sortBy || 'createdAt';
  const sortOrder = queryParams.sortOrder || 'desc';
  
  let orderBy: any = {};
  if (sortBy === 'amount') {
    orderBy.amount = sortOrder;
  } else if (sortBy === 'dueDate') {
    orderBy.dueDate = sortOrder;
  } else if (sortBy === 'status') {
    orderBy.status = sortOrder;
  } else if (sortBy === 'paymentType') {
    orderBy.paymentType = sortOrder;
  } else {
    orderBy.createdAt = 'desc'; // default sort
  }

  try {
    // Fetch data using raw query if Prisma client doesn't have Payment model
    const [data, count] = await prisma.$transaction([
      prisma.$queryRaw`
        SELECT 
          p.id,
          p."studentId",
          p.amount,
          p."paymentType",
          p."paymentMethod",
          p."dueDate",
          p.description,
          p.status,
          p."createdAt",
          s.name as "studentName",
          s.surname as "studentSurname",
          s.email as "studentEmail",
          s.img as "studentImg"
        FROM "Payment" p
        LEFT JOIN "Student" s ON p."studentId" = s.id
        ORDER BY p."createdAt" DESC
        LIMIT ${ITEM_PER_PAGE}
        OFFSET ${ITEM_PER_PAGE * (p - 1)}
      `,
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "Payment"`
    ]);

    // Transform the raw data to match the expected format
    const transformedData: PaymentList[] = (data as any[]).map((item: any) => ({
      id: item.id,
      studentId: item.studentId,
      amount: parseFloat(item.amount),
      paymentType: item.paymentType,
      paymentMethod: item.paymentMethod,
      dueDate: new Date(item.dueDate),
      description: item.description,
      status: item.status,
      createdAt: new Date(item.createdAt),
      student: {
        name: item.studentName || 'Unknown',
        surname: item.studentSurname || 'Student',
        email: item.studentEmail,
        img: item.studentImg,
      }
    }));

    const totalCount = parseInt((count as any[])[0]?.count || '0');

    return (
      <div className="bg-white p-4 flex-1 w-full h-full">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Payments</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch 
              placeholder="Search payments..." 
              searchFields={["studentId", "description", "student.name", "student.surname", "student.email"]}
            />
            
            <div className="flex items-center gap-4 self-end">
              <FilterSortButtons />
              {finalRole === "admin" ? (
                <div className="flex items-center gap-2">
                  <FormContainer table="payment" type="create" />
                  <span className="text-sm font-medium text-green-600">Click + to add payment</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm font-medium cursor-not-allowed"
                    disabled
                  >
                    Add Payment (Admin Only)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Search Results Indicator */}
        <SearchResultsIndicator totalResults={totalCount} />
        
        {/* LIST */}
        <Table columns={columns} renderRow={renderRow} data={transformedData} />
        
        {/* PAGINATION */}
        <Pagination page={p} count={totalCount} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching payments:', error);
    return (
      <div className="bg-white p-4 flex-1 w-full h-full">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payments</h2>
          <p className="text-gray-600">There was an error loading the payment data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
};

export default PaymentListPage;
