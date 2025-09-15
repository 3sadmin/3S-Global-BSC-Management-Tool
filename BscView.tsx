import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './App.tsx';
import api from './mockApi.ts';
import { Bsc, Kpi, BscPerspective, BscStatus, UserRole } from './types.ts';
import { PlusCircleIcon, TrashIcon, DownloadIcon, EditIcon } from './icons.tsx';

const BscView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bsc, setBsc] = useState<Bsc | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const pdfExportRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!id) {
            setIsEditing(true);
            const manager = user?.managerId ? api.getUserById(user.managerId) : Promise.resolve(undefined);
            manager.then(m => {
                 setBsc({
                    id: '',
                    userId: user!.id,
                    userName: user!.name,
                    userLevel: user!.level,
                    userDoj: user!.doj,
                    userTeam: user!.department,
                    reportingTo: m?.name || 'N/A',
                    date: new Date().toISOString().split('T')[0],
                    status: BscStatus.DRAFT,
                    perspectives: [
                        { id: 'p1', name: 'Finance', kra: { id: 'kra1', name: '', weightage: 20, kpiOwner: '', kpis: []}},
                        { id: 'p2', name: 'Customer', kra: { id: 'kra2', name: '', weightage: 20, kpiOwner: '', kpis: []}},
                        { id: 'p3', name: 'Internal Process', kra: { id: 'kra3', name: '', weightage: 20, kpiOwner: '', kpis: []}},
                        { id: 'p4', name: 'Learning and Growth', kra: { id: 'kra4', name: '', weightage: 20, kpiOwner: '', kpis: []}},
                        { id: 'p5', name: 'Infrastructure', kra: { id: 'kra5', name: '', weightage: 20, kpiOwner: '', kpis: []}},
                    ],
                    history: [],
                });
            })
           
            setLoading(false);
        } else {
            api.getBscById(id).then(data => {
                setBsc(data || null);
                setLoading(false);
            });
        }
    }, [id, user]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, perspectiveId: string, kpiId: string, field: keyof Kpi) => {
        if (!bsc) return;
        const newPerspectives = bsc.perspectives.map(p => {
            if (p.id === perspectiveId) {
                const newKpis = p.kra.kpis.map(k => k.id === kpiId ? { ...k, [field]: e.target.value } : k);
                return { ...p, kra: { ...p.kra, kpis: newKpis } };
            }
            return p;
        });
        setBsc({ ...bsc, perspectives: newPerspectives });
    };
    
     const handlePerspectiveChange = (e: React.ChangeEvent<HTMLInputElement>, perspectiveId: string, field: 'name') => {
        if (!bsc) return;
        const newPerspectives = bsc.perspectives.map(p => 
            p.id === perspectiveId ? { ...p, [field]: e.target.value } : p
        );
        setBsc({ ...bsc, perspectives: newPerspectives });
    };

    const handleKraChange = (e: React.ChangeEvent<HTMLInputElement>, perspectiveId: string, field: string) => {
        if (!bsc) return;
         const newPerspectives = bsc.perspectives.map(p => {
            if (p.id === perspectiveId) {
                const updatedKra = { ...p.kra, [field]: field === 'weightage' ? parseInt(e.target.value) || 0 : e.target.value };
                return { ...p, kra: updatedKra };
            }
            return p;
        });
        setBsc({ ...bsc, perspectives: newPerspectives });
    };
    
    const addPerspective = () => {
        if (!bsc) return;
        const newPerspective: BscPerspective = {
            id: `p${Date.now()}`,
            name: 'New Perspective',
            kra: { id: `kra${Date.now()}`, name: '', weightage: 0, kpiOwner: '', kpis: [] }
        };
        setBsc({ ...bsc, perspectives: [...bsc.perspectives, newPerspective] });
    };

    const removePerspective = (perspectiveId: string) => {
        if (!bsc) return;
        setBsc({ ...bsc, perspectives: bsc.perspectives.filter(p => p.id !== perspectiveId) });
    };

    const addKpi = (perspectiveId: string) => {
        if (!bsc) return;
        const newPerspectives = bsc.perspectives.map(p => {
            if (p.id === perspectiveId) {
                const newKpi: Kpi = { id: `kpi${Date.now()}`, resultKpi: '', processKpi: '', uom: '', definition: '', fom: '', baseLevel: '', target: '', initiatives: '' };
                const updatedKpis = [...p.kra.kpis, newKpi];
                return { ...p, kra: { ...p.kra, kpis: updatedKpis }};
            }
            return p;
        });
        setBsc({ ...bsc, perspectives: newPerspectives });
    };

    const removeKpi = (perspectiveId: string, kpiId: string) => {
        if (!bsc) return;
        const newPerspectives = bsc.perspectives.map(p => {
            if (p.id === perspectiveId) {
                 const updatedKpis = p.kra.kpis.filter(k => k.id !== kpiId);
                return { ...p, kra: { ...p.kra, kpis: updatedKpis }};
            }
            return p;
        });
        setBsc({ ...bsc, perspectives: newPerspectives });
    };

    const handleSave = async (newStatus: BscStatus) => {
        if (!bsc || !user) return;
        const totalWeightage = bsc.perspectives.reduce((sum, p) => sum + p.kra.weightage, 0);
        if (totalWeightage !== 100) {
            alert('Total weightage of all perspectives must be 100%.');
            return;
        }
        const updatedBsc = { ...bsc, status: newStatus };
        if (id) {
            await api.updateBsc(id, updatedBsc, user);
        } else {
            await api.createBsc(updatedBsc, user);
        }
        navigate('/');
    };
    
    const handleApprovalAction = async (newStatus: BscStatus) => {
        if (!bsc || !user || !id) return;
        const updatedBsc = { ...bsc, status: newStatus };
        if (user.role === UserRole.MANAGER) {
            updatedBsc.managerComments = comment;
        } else if (user.role === UserRole.CEO) {
            updatedBsc.ceoComments = comment;
        }
        await api.updateBsc(id, updatedBsc, user);
        navigate('/');
    };

    const handleExportToPdf = () => {
        const input = pdfExportRef.current;
        if (input) {
            // @ts-ignore
            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                // @ts-ignore
                const pdf = new jspdf.jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${bsc?.userName}_BSC.pdf`);
            });
        }
    };
    
    if (loading) return <div>Loading BSC...</div>;
    if (!bsc) return <div>BSC not found.</div>;
    
    const canEdit = user && (user.id === bsc.userId) && (bsc.status === BscStatus.DRAFT || bsc.status === BscStatus.REJECTED_BY_MANAGER || bsc.status === BscStatus.QUERIED_BY_MANAGER);
    const canReview = user && (
        (user.role === UserRole.MANAGER && bsc.status === BscStatus.PENDING_MANAGER) ||
        (user.role === UserRole.CEO && bsc.status === BscStatus.PENDING_CEO)
    );

    if (isEditing) {
        const totalWeightage = bsc.perspectives.reduce((sum, p) => sum + p.kra.weightage, 0);
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{id ? 'Edit' : 'Create'} BSC</h2>
                    <div className={`text-lg font-bold p-2 rounded ${totalWeightage !== 100 ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
                        Total Weightage: {totalWeightage}%
                    </div>
                </div>
                {bsc.perspectives.map(p => (
                    <div key={p.id} className="mb-6 border rounded-md p-4 relative pt-8">
                        <button onClick={() => removePerspective(p.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" title="Remove Perspective">
                           <TrashIcon className="w-5 h-5"/>
                        </button>
                        <div className="flex items-center mb-4">
                            <input value={p.name} onChange={(e) => handlePerspectiveChange(e, p.id, 'name')} className="text-xl font-semibold p-2 border rounded w-1/3" placeholder="Perspective Name" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input value={p.kra.name} onChange={(e) => handleKraChange(e, p.id, 'name')} placeholder="Result KRA" className="p-2 border rounded"/>
                             <input value={p.kra.kpiOwner} onChange={(e) => handleKraChange(e, p.id, 'kpiOwner')} placeholder="KPI Owner" className="p-2 border rounded"/>
                            <input type="number" value={p.kra.weightage} onChange={(e) => handleKraChange(e, p.id, 'weightage')} placeholder="Weightage %" className="p-2 border rounded"/>
                        </div>
                        {p.kra.kpis.map(kpi => (
                            <div key={kpi.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-2 border-t">
                                <input value={kpi.resultKpi} onChange={(e) => handleInputChange(e, p.id, kpi.id, 'resultKpi')} placeholder="Result KPI" className="p-2 border rounded col-span-2"/>
                                <input value={kpi.processKpi} onChange={(e) => handleInputChange(e, p.id, kpi.id, 'processKpi')} placeholder="Process KPI" className="p-2 border rounded col-span-2"/>
                                <input value={kpi.uom} onChange={(e) => handleInputChange(e, p.id, kpi.id, 'uom')} placeholder="UOM" className="p-2 border rounded"/>
                                <input value={kpi.definition} onChange={(e) => handleInputChange(e, p.id, kpi.id, 'definition')} placeholder="Definition" className="p-2 border rounded"/>
                                <input value={kpi.fom} onChange={(e) => handleInputChange(e, p.id, kpi.id, 'fom')} placeholder="FOM" className="p-2 border rounded"/>
                                <input value={kpi.baseLevel} onChange={(e) => handleInputChange(e, p.id, kpi.id, 'baseLevel')} placeholder="Base Level" className="p-2 border rounded"/>
                                <input value={kpi.target} onChange={(e) => handleInputChange(e, p.id, kpi.id, 'target')} placeholder="Target" className="p-2 border rounded"/>
                                <input value={kpi.initiatives} onChange={(e) => handleInputChange(e, p.id, kpi.id, 'initiatives')} placeholder="Initiatives" className="p-2 border rounded col-span-2"/>
                                <button onClick={() => removeKpi(p.id, kpi.id)} className="text-red-500 hover:text-red-700 flex items-center justify-center"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                        <button onClick={() => addKpi(p.id)} className="flex items-center text-sm text-primary mt-2"><PlusCircleIcon className="w-5 h-5 mr-1"/> Add KPI</button>
                    </div>
                ))}
                 <button onClick={addPerspective} className="flex items-center text-primary mt-2 p-2 border-dashed border-2 border-primary rounded-md hover:bg-sky-50">
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Perspective
                </button>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={() => handleSave(BscStatus.DRAFT)} className="bg-gray-500 text-white px-4 py-2 rounded">Save Draft</button>
                    <button onClick={() => handleSave(BscStatus.PENDING_MANAGER)} className="bg-primary text-white px-4 py-2 rounded">Submit for Review</button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-bold text-gray-800">BSC Details</h2>
                 <div className="flex space-x-2">
                    {canEdit && <button onClick={() => setIsEditing(true)} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"><EditIcon className="w-4 h-4 mr-2"/> Edit</button>}
                    <button onClick={handleExportToPdf} className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"><DownloadIcon className="w-4 h-4 mr-2"/> Export PDF</button>
                 </div>
            </div>
            
            <div ref={pdfExportRef} className="bg-white p-6 rounded-lg shadow-md">
                {/* Viewer */}
                <div className="grid grid-cols-4 gap-4 text-sm mb-4 border-b pb-4">
                    <div><strong>Name:</strong> {bsc.userName}</div>
                    <div><strong>Level:</strong> {bsc.userLevel}</div>
                    <div><strong>DOJ:</strong> {bsc.userDoj}</div>
                    <div><strong>Team:</strong> {bsc.userTeam}</div>
                    <div><strong>Reporting to:</strong> {bsc.reportingTo}</div>
                    <div><strong>Date:</strong> {bsc.date}</div>
                    <div><strong>Status:</strong> {bsc.status}</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm table-fixed">
                        <thead className="bg-slate-100">
                             <tr>
                                <th className="p-2 border text-left w-1/12">BSC Perspective</th>
                                <th className="p-2 border text-left w-1/12">Result KRA</th>
                                <th className="p-2 border text-left w-[8%]">Weightage</th>
                                <th className="p-2 border text-left w-1/12">KPI Owner</th>
                                <th className="p-2 border text-left w-1/12">Result KPI</th>
                                <th className="p-2 border text-left w-1/12">Process KPI</th>
                                <th className="p-2 border text-left w-[5%]">UOM</th>
                                <th className="p-2 border text-left w-1/12">Definition</th>
                                <th className="p-2 border text-left w-[5%]">FOM</th>
                                <th className="p-2 border text-left w-[8%]">Base Level (FY 24-25)</th>
                                <th className="p-2 border text-left w-[8%]">Target (FY 25-26)</th>
                                <th className="p-2 border text-left w-1/12">Initiatives</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bsc.perspectives.map(p => (
                                p.kra.kpis.length > 0 ? p.kra.kpis.map((kpi, index) => (
                                    <tr key={kpi.id}>
                                        {index === 0 && <td rowSpan={p.kra.kpis.length} className="p-2 border font-semibold align-top break-words">{p.name}</td>}
                                        {index === 0 && <td rowSpan={p.kra.kpis.length} className="p-2 border align-top break-words">{p.kra.name}</td>}
                                        {index === 0 && <td rowSpan={p.kra.kpis.length} className="p-2 border align-top break-words">{p.kra.weightage}%</td>}
                                        {index === 0 && <td rowSpan={p.kra.kpis.length} className="p-2 border align-top break-words">{p.kra.kpiOwner}</td>}
                                        <td className="p-2 border break-words">{kpi.resultKpi}</td>
                                        <td className="p-2 border break-words">{kpi.processKpi}</td>
                                        <td className="p-2 border break-words">{kpi.uom}</td>
                                        <td className="p-2 border break-words">{kpi.definition}</td>
                                        <td className="p-2 border break-words">{kpi.fom}</td>
                                        <td className="p-2 border break-words">{kpi.baseLevel}</td>
                                        <td className="p-2 border break-words">{kpi.target}</td>
                                        <td className="p-2 border break-words">{kpi.initiatives}</td>
                                    </tr>
                                )) : (
                                     <tr key={p.id}>
                                        <td className="p-2 border font-semibold align-top break-words">{p.name}</td>
                                        <td className="p-2 border align-top break-words">{p.kra.name}</td>
                                        <td className="p-2 border align-top break-words">{p.kra.weightage}%</td>
                                        <td className="p-2 border align-top break-words">{p.kra.kpiOwner}</td>
                                        <td className="p-2 border" colSpan={8}></td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {canReview && (
                 <div className="bg-white p-6 rounded-lg shadow-md mt-4">
                    <h3 className="text-xl font-semibold mb-2">Review & Action</h3>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-2 border rounded mb-2" placeholder="Add your comments..."></textarea>
                    <div className="flex justify-end space-x-2">
                        {user.role === UserRole.MANAGER && (
                             <button onClick={() => handleApprovalAction(BscStatus.QUERIED_BY_MANAGER)} className="bg-blue-500 text-white px-4 py-2 rounded">Query</button>
                        )}
                        <button onClick={() => handleApprovalAction(user.role === UserRole.MANAGER ? BscStatus.REJECTED_BY_MANAGER : BscStatus.REJECTED_BY_CEO)} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
                        <button onClick={() => handleApprovalAction(user.role === UserRole.MANAGER ? BscStatus.PENDING_CEO : BscStatus.APPROVED)} className="bg-green-500 text-white px-4 py-2 rounded">Approve</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BscView;
