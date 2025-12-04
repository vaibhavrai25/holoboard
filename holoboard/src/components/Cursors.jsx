import React, { useEffect, useState } from 'react';
import { Circle, Text, Group } from 'react-konva';
import { awareness } from '../services/collaboration';
import { useUser } from '@clerk/clerk-react';

const getRandomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16);
const myColor = getRandomColor();

const Cursors = ({ stageRef }) => {
  const { user } = useUser();
  const [users, setUsers] = useState(new Map());

  useEffect(() => {
    
    if (!awareness) return; 

    if (user) {
        awareness.setLocalStateField('user', {
            name: user.firstName || "Guest",
            color: myColor,
            x: 0,
            y: 0,
        });
    }

    const handleMouseMove = () => {
        if (!stageRef.current) return;
        const stage = stageRef.current;
        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = stage.getPointerPosition();
        
        if (pos) {
            const localPos = transform.point(pos);
            
            if (awareness) {
                awareness.setLocalStateField('user', {
                    ...awareness.getLocalState().user,
                    x: localPos.x,
                    y: localPos.y
                });
            }
        }
    };

    const handleUpdate = () => {
        if (awareness) {
            const states = awareness.getStates();
            setUsers(new Map(states));
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    awareness.on('change', handleUpdate);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (awareness) awareness.off('change', handleUpdate);
    };
  }, [user]);


  if (!awareness) return null;

  return (
    <>
      {Array.from(users.entries()).map(([id, state]) => {
        if (id === awareness.clientID || !state.user) return null;
        const { x, y, name, color } = state.user;
        return (
          <Group key={id} x={x} y={y}>
            <Circle radius={8} fill={color} stroke="white" strokeWidth={2} />
            <Text 
                text={name} 
                y={-20} x={10} 
                fontSize={14} fill={color} fontStyle="bold"
                shadowColor="black" shadowBlur={2} 
            />
          </Group>
        );
      })}
    </>
  );
};

export default Cursors;
