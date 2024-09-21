'use client';
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation'

export function AuditReport() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Wait until the router is ready before proceeding
    
    const fetchData = async () => {
      try {
        let apiUrl = '';

        const search = searchParams.get('id')


        // Check if the URL contains 'id' or 'smartContractId'
        if (search) {
          apiUrl = `http://localhost:3001/report/${search}`;
          console.log('apiurl', apiUrl)
        } else if (searchParams.get('smartContractId')) {
          apiUrl = `http://localhost:3001/reportIdForSmartContract/${searchParams.get('smartContractId')}`;
          
          console.log('apiurl', apiUrl)
        }

        // Make sure apiUrl is set before making the request
        if (!apiUrl) return;

        setLoading(true);

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }

        const data = await response.json();
        console.log('data', data.reportContent)

        setReport(data.reportContent);
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!report) {
    return <div className="flex justify-center items-center h-screen">No report found</div>;
  }

  const {contract} = report;
  const totalChecks = Object.values(contract.criteria).reduce((acc, curr) => acc + Object.keys(curr).length - 2, 0)
  const passedChecks = Object.values(contract.criteria).reduce((acc, curr) => {
    return acc + Object.entries(curr).filter(
      ([key, value]) => key !== 'issues' && key !== 'codeFixes' && value === true
    ).length;
  }, 0)

  return (
    (<div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Smart Contract Audit Report</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">{contract.name}</h2>
        <p className="text-gray-600 mb-4">Audit Date: {contract.auditDate}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-lg font-semibold">Total Checks</p>
            <p className="text-3xl font-bold">{totalChecks}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-lg font-semibold">Passed Checks</p>
            <p className="text-3xl font-bold">{passedChecks}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-lg font-semibold">Issues Found</p>
            <p className="text-3xl font-bold">{totalChecks - passedChecks}</p>
          </div>
        </div>
      </div>
      {Object.entries(contract.criteria).map(([category, checks]) => (
        <div key={category} className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">{category}</h3>
          <div className="space-y-4">
            {Object.entries(checks).map(([check, value]) => {
              if (check === 'issues' || check === 'codeFixes') return null
              return (
                (<div key={check} className="flex items-center">
                  {value === true ? (
                    <CheckCircle className="text-green-500 mr-2" />
                  ) : (
                    <XCircle className="text-red-500 mr-2" />
                  )}
                  <span className="text-gray-700">{check}</span>
                </div>)
              );
            })}
          </div>
          {checks.issues.length > 0 && (
            <div className="mt-4 bg-red-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-red-700">Issues Detected</h4>
              <ul className="list-disc list-inside">
                {checks.issues.map((issue, index) => (
                  <li key={index} className="text-red-600">{issue}</li>
                ))}
              </ul>
            </div>
          )}
          {checks.codeFixes.length > 0 && (
            <div className="mt-4 bg-green-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-green-700">Suggested Code Fixes</h4>
              {checks.codeFixes.map((fix, index) => (
                <pre key={index} className="bg-white p-2 rounded mt-2 overflow-x-auto">
                  <code className="text-sm">{fix}</code>
                </pre>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>)
  );
}