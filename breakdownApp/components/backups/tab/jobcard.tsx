
// <Modal
//     visible={!!selectedJob}
//     transparent
//     animationType="slide"
//     onRequestClose={() => setSelectedJob(null)}
// >
//     <View
//         style={{
//             flex: 1,
//             backgroundColor: 'rgba(0,0,0,0.5)',
//             padding: 10,
//         }}
//     >
//         <ScrollView
//             contentContainerStyle={{
//                 paddingVertical: 1,
//             }}
//             showsVerticalScrollIndicator={false}
//             showsHorizontalScrollIndicator={false}
//         >
//             <View
//                 style={{
//                     backgroundColor: '#fff',
//                     borderRadius: 16,
//                     padding: 20,
//                 }}
//             >
//                 {selectedJob && (
//                     <>
//                         <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 8, color: '#1a3d6d' }}>
//                             Job Card
//                         </Text>
//                         <View style={{ marginBottom: 12 }}>
//                             <Text style={{ color: '#333', fontWeight: 'bold' }}>Job ID: <Text style={{ fontWeight: 'normal' }}>{selectedJob.id}</Text></Text>
//                             <Text style={{ color: '#333' }}>Type: {selectedJob.emergency_type}</Text>
//                             <Text style={{ color: '#333' }}>Status: {selectedJob.status}</Text>
//                             <Text style={{ color: '#333' }}>Description: {selectedJob.description}</Text>
//                         </View>
//                         <View style={{
//                             flexDirection: 'row',
//                             justifyContent: 'space-between',
//                             marginBottom: 12,
//                         }}>
//                             <View style={{ flex: 1, marginRight: 8 }}>
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Date</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="YYYY-MM-DD"
//                                     keyboardType="default"
//                                     value={selectedJob?.date || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, date: text })}

//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Client</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Client Name"
//                                     value={selectedJob?.client_name || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, client_name: text })}

//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Contact</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Contact"
//                                     keyboardType="phone-pad"
//                                     value={selectedJob?.contact || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, contact: text })}
//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Time</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="HH:MM"
//                                     keyboardType="default"
//                                     value={selectedJob?.time || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, time: text })}

//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Location</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Location"
//                                     value={selectedJob?.location || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, location: text })}
//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Job Type</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Job Type"
//                                     value={selectedJob?.job_type || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, job_type: text })}
//                                 />
//                             </View>
//                             <View style={{ flex: 1 }}>
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Vehicle Make</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Vehicle Make"
//                                     value={selectedJob?.vehicle_make || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, vehicle_make: text })}
//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Horse Fleet no</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Horse Fleet no"
//                                     value={selectedJob?.horse_fleet_no || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, horse_fleet_no: text })}
//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Horse Reg no</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Horse Reg no"
//                                     value={selectedJob?.horse_reg_no || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, horse_reg_no: text })}
//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>ODO Reading</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="ODO Reading"
//                                     keyboardType="numeric"
//                                     value={selectedJob?.odo_reading ? selectedJob.odo_reading.toString() : ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, odo_reading: text })}

//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Mechanic</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Mechanic"
//                                     value={selectedJob?.mechanic || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, mechanic: text })}
//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Trailer Fleet no</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Trailer Fleet no"
//                                     value={selectedJob?.trailer_fleet_no || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, trailer_fleet_no: text })}
//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Trailer Reg no</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Trailer Reg no"
//                                     value={selectedJob?.trailer_reg_no || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, trailer_reg_no: text })}
//                                 />
//                                 <Text style={{ color: '#555', marginBottom: 2 }}>Technician</Text>
//                                 <TextInput
//                                     style={{
//                                         borderColor: '#e0e0e0',
//                                         borderWidth: 1,
//                                         borderRadius: 6,
//                                         padding: 6,
//                                         marginBottom: 4,
//                                         color: '#222',
//                                         backgroundColor: '#f9f9f9',
//                                     }}
//                                     placeholder="Technician"
//                                     value={selectedJob?.technician || ''}
//                                     onChangeText={text => setSelectedJob({ ...selectedJob, technician: text })}
//                                 />
//                             </View>
//                         </View>
//                         <View style={{ marginBottom: 12 }}>
//                             <Text style={{ color: '#1a3d6d', fontWeight: 'bold', marginBottom: 4 }}>
//                                 Client Instructions & Requirements
//                             </Text>
//                             <TextInput
//                                 style={{
//                                     borderColor: '#e0e0e0',
//                                     borderWidth: 1,
//                                     borderRadius: 8,
//                                     padding: 10,
//                                     minHeight: 60,
//                                     color: '#222',
//                                     backgroundColor: '#f9f9f9',
//                                     marginBottom: 4,
//                                 }}
//                                 multiline
//                                 value={selectedJob.description}
//                                 onChangeText={(text) => setSelectedJob({ ...selectedJob, description: text })}
//                             />
//                         </View>
//                         {/* Dynamic Items Section */}
//                         <View style={{ marginBottom: 12 }}>
//                             <Text style={{ color: '#1a3d6d', fontWeight: 'bold', marginBottom: 4 }}>
//                                 Items to Send Along
//                             </Text>
//                             {/* <ItemListInput items={items} setItems={setItems} /> */}
//                         </View>

//                         {/* Notes */}
//                         <View style={{ marginBottom: 12 }}>
//                             <Text style={{ color: '#1a3d6d', fontWeight: 'bold', marginBottom: 4 }}>
//                                 Additional Notes
//                             </Text>
//                             <TextInput
//                                 style={{
//                                     borderColor: '#e0e0e0',
//                                     borderWidth: 1,
//                                     borderRadius: 8,
//                                     padding: 10,
//                                     minHeight: 60,
//                                     color: '#222',
//                                     backgroundColor: '#f9f9f9',
//                                 }}
//                                 placeholder="Add notes..."
//                                 placeholderTextColor="#888"
//                                 multiline
//                                 value={notes}
//                                 onChangeText={setNotes}
//                             />
//                         </View>

//                         <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
//                             <TouchableOpacity
//                                 onPress={saveJobCard}
//                                 style={{
//                                     backgroundColor: '#1976d2',
//                                     paddingVertical: 12,
//                                     paddingHorizontal: 24,
//                                     borderRadius: 8,
//                                     marginRight: 10
//                                 }}>
//                                 <Text style={{ color: 'white', fontWeight: 'bold' }}>
//                                     {isLoading ? "Submitting..." : "Submit Card"}
//                                 </Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity
//                                 onPress={() => setSelectedJob(null)}
//                                 style={{
//                                     backgroundColor: '#e0e0e0',
//                                     paddingVertical: 12,
//                                     paddingHorizontal: 24,
//                                     borderRadius: 8
//                                 }}>
//                                 <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </>
//                 )}
//             </View>
//         </ScrollView>
//     </View>
// </Modal>