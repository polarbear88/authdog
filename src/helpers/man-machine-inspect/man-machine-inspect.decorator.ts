import { SetMetadata, UseGuards } from '@nestjs/common';
import { ManMachineInspectGuard } from './man-machine-inspect.guard';

export const MAN_MACHINE_INSPECT_TYPE_KEY = 'MAN_MACHINE_INSPECT_TYPE_KEY';

export const ManMachineInspect = (type: string): MethodDecorator => {
    return (target: any, propertyKey: string | symbol, descriptor: any) => {
        SetMetadata(MAN_MACHINE_INSPECT_TYPE_KEY, type)(target, propertyKey, descriptor);
        UseGuards(ManMachineInspectGuard)(target, propertyKey, descriptor);
    };
};
