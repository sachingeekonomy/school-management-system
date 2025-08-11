"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState<any>(null);

  useEffect(() => {
    // Fetch the swagger spec from our API
    fetch('/api/swagger')
      .then(response => response.json())
      .then(spec => setSwaggerSpec(spec))
      .catch(error => {
        console.error('Error loading Swagger spec:', error);
        // Fallback to a basic spec
        setSwaggerSpec({
          openapi: '3.0.0',
          info: {
            title: 'School Management System API',
            version: '1.0.0',
            description: 'API documentation for the School Management System'
          },
          servers: [
            {
              url: 'http://localhost:3000',
              description: 'Development server'
            }
          ],
          paths: {
            '/api/students': {
              get: {
                summary: 'Get all students',
                tags: ['Students'],
                responses: {
                  '200': {
                    description: 'List of students retrieved successfully'
                  }
                }
              },
              post: {
                summary: 'Create a new student',
                tags: ['Students'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/Student'
                      }
                    }
                  }
                },
                responses: {
                  '201': {
                    description: 'Student created successfully'
                  }
                }
              }
            },
            '/api/teachers': {
              get: {
                summary: 'Get all teachers',
                tags: ['Teachers'],
                responses: {
                  '200': {
                    description: 'List of teachers retrieved successfully'
                  }
                }
              },
              post: {
                summary: 'Create a new teacher',
                tags: ['Teachers'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/Teacher'
                      }
                    }
                  }
                },
                responses: {
                  '201': {
                    description: 'Teacher created successfully'
                  }
                }
              }
            }
          },
          components: {
            schemas: {
              Student: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  name: { type: 'string' },
                  surname: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                  bloodType: { type: 'string' },
                  sex: { type: 'string', enum: ['MALE', 'FEMALE'] },
                  birthday: { type: 'string', format: 'date' },
                  gradeId: { type: 'integer' },
                  classId: { type: 'integer' },
                  parentId: { type: 'string' }
                },
                required: ['username', 'name', 'surname', 'address', 'bloodType', 'sex', 'birthday', 'gradeId', 'classId', 'parentId']
              },
              Teacher: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  name: { type: 'string' },
                  surname: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                  bloodType: { type: 'string' },
                  sex: { type: 'string', enum: ['MALE', 'FEMALE'] },
                  birthday: { type: 'string', format: 'date' }
                },
                required: ['username', 'name', 'surname', 'address', 'bloodType', 'sex', 'birthday']
              }
            }
          }
        });
      });
  }, []);

  if (!swaggerSpec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Documentation</h1>
        <div className="bg-white rounded-lg shadow-lg">
          <SwaggerUI 
            spec={swaggerSpec}
            docExpansion="list"
            defaultModelsExpandDepth={2}
            defaultModelExpandDepth={2}
            tryItOutEnabled={true}
            supportedSubmitMethods={['get', 'post', 'put', 'delete']}
          />
        </div>
      </div>
    </div>
  );
}

