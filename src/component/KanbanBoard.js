import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '../supabaseClient';

const columnsFromBackend = {
  todo: { name: '📝 To Do', items: [] },
  inprogress: { name: '🚧 In Progress', items: [] },
  done: { name: '✅ Done', items: [] }
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState(columnsFromBackend);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error) {
      setColumns({
        todo: { ...columnsFromBackend.todo, items: data.filter((t) => t.status === 'todo') },
        inprogress: { ...columnsFromBackend.inprogress, items: data.filter((t) => t.status === 'inprogress') },
        done: { ...columnsFromBackend.done, items: data.filter((t) => t.status === 'done') }
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const draggedItem = sourceCol.items[source.index];

    const newSourceItems = [...sourceCol.items];
    newSourceItems.splice(source.index, 1);
    const newDestItems = [...destCol.items];
    newDestItems.splice(destination.index, 0, draggedItem);

    const newColumns = {
      ...columns,
      [source.droppableId]: { ...sourceCol, items: newSourceItems },
      [destination.droppableId]: { ...destCol, items: newDestItems }
    };

    setColumns(newColumns);

    await supabase.from('todos').update({ status: destination.droppableId }).eq('id', draggedItem.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-10">
      <h1 className="text-4xl font-bold text-white text-center mb-10 drop-shadow-md">Kanban Task Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <Droppable droppableId={columnId} key={columnId}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-white rounded-3xl p-6 shadow-2xl border-t-8 border-indigo-500"
                >
                  <h2 className="text-2xl font-semibold mb-6 text-indigo-700 flex items-center gap-2">
                    {column.name}
                  </h2>
                  <div className="space-y-4">
                    {column.items.map((item, index) => (
                      <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-100 border-l-4 border-indigo-500 rounded-xl p-4 text-sm font-medium text-gray-800 shadow-sm hover:shadow-md transition duration-200"
                          >
                            {item.task}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}